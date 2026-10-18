import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const app = express()

const ALLOWED_ORIGIN = 'https://sipuskes.vercel.app'

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin === ALLOWED_ORIGIN) return callback(null, true)
    return callback(new Error('Origin tidak diizinkan oleh CORS.'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}))
app.use(express.json({ limit: '1mb' }))

// Handle preflight OPTIONS explicitly
app.options('*', cors())

// Auto-migration: buat tabel consultations jika belum ada (jalan sekali pada cold start)
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

let dbReady = false
async function ensureDb() {
  if (!dbReady) {
    try {
      await ensureConsultationsTable()
      dbReady = true
    } catch (error) {
      console.error('[migration]', error)
    }
  }
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

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'postgresql' })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

app.get('/api/consultations', async (_req, res, next) => {
  try {
    await ensureDb()
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
    await ensureDb()
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
    res.status(201).json({ consultation: toConsultation(rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/consultations/:id/accept', async (req, res, next) => {
  try {
    await ensureDb()
    const { rows } = await pool.query(
      `UPDATE consultations SET status = 'ACTIVE' WHERE id = $1 AND status = 'WAITING' RETURNING *`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Konsultasi tidak ditemukan atau sudah diproses.' })
    res.json({ consultation: toConsultation(rows[0]) })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error('[api]', error)
  res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan pada layanan konsultasi.' })
})

export default app
