import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import 'dotenv/config'
import pg from 'pg'
import { WebSocketServer, WebSocket } from 'ws'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const port = Number(process.env.PORT || 3001)
const app = express()
const server = createServer(app)
const webSockets = new WebSocketServer({ noServer: true })

const ALLOWED_ORIGIN = 'https://sipuskes.vercel.app'

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin === ALLOWED_ORIGIN) return callback(null, true)
    return callback(new Error('Origin tidak diizinkan oleh CORS.'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

// Auto-migration: buat tabel consultations jika belum ada
async function ensureConsultationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      patient_name VARCHAR NOT NULL,
      room_code VARCHAR NOT NULL UNIQUE,
      status VARCHAR NOT NULL DEFAULT 'WAITING',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status)`)
}

function toConsultation(row) {
  if (!row) return null
  return {
    id: String(row.id),
    room: row.room_code,
    patient: row.patient_name,
    status: row.status === 'WAITING' ? 'Menunggu dokter' : row.status === 'ACTIVE' ? 'Sedang berlangsung' : 'Selesai',
    createdAt: new Date(row.created_at).toISOString(),
  }
}

async function notifyDoctor(type, consultation) {
  const message = JSON.stringify({ type, consultation })
  for (const socket of webSockets.clients) {
    if (socket.readyState === WebSocket.OPEN && socket.role === 'doctor') {
      socket.send(message)
    }
  }
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'postgresql' })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

app.get('/api/consultations', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM consultations WHERE status = $1 ORDER BY created_at DESC',
      ['WAITING']
    )
    res.json({ consultations: rows.map(toConsultation) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/consultations', async (req, res, next) => {
  try {
    const { patientName, roomCode } = req.body
    if (!patientName || !roomCode) {
      return res.status(400).json({ error: 'patientName dan roomCode wajib diisi.' })
    }
    const { rows } = await pool.query(
      `INSERT INTO consultations (patient_name, room_code, status)
       VALUES ($1, $2, 'WAITING')
       RETURNING *`,
      [patientName, roomCode]
    )
    const consultation = toConsultation(rows[0])
    notifyDoctor('consultation.created', consultation)
    res.status(201).json({ consultation })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/consultations/:id/accept', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE consultations SET status = 'ACTIVE' WHERE id = $1 AND status = 'WAITING' RETURNING *`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Konsultasi tidak ditemukan atau sudah diproses.' })
    const consultation = toConsultation(rows[0])
    notifyDoctor('consultation.updated', consultation)
    res.json({ consultation })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error('[api]', error)
  res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan pada layanan konsultasi.' })
})

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  if (url.pathname !== '/ws') {
    socket.destroy()
    return
  }
  if (url.searchParams.get('role') !== 'doctor') {
    socket.destroy()
    return
  }
  webSockets.handleUpgrade(request, socket, head, (client) => {
    client.role = 'doctor'
    webSockets.emit('connection', client)
  })
})

webSockets.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connected' }))
})

pool.on('error', (error) => console.error('[postgres]', error))

ensureConsultationsTable()
  .then(() => {
    server.listen(port, '0.0.0.0', () => {
      console.log(`SIPUSKES Express API + WebSocket berjalan di http://0.0.0.0:${port}`)
    })
  })
  .catch((error) => {
    console.error('[migration]', error)
    process.exit(1)
  })

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close()
    webSockets.close()
    pool.end().finally(() => process.exit(0))
  })
}
