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

// 1. CORS Permisif (Aman untuk Vercel Serverless)
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

let dbReady = false
async function ensureDb() {
  if (!dbReady) {
    try { await ensureConsultationsTable(); await ensurePatientsTable(); dbReady = true } catch (e) { console.error('[migration]', e) }
  }
}
app.use(async (_req, _res, next) => { await ensureDb(); next() })

// 2. Auto-migration PostgreSQL
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

async function ensurePatientsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      medical_record_number VARCHAR UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
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

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'postgresql' })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

// 3. Endpoint GET untuk Polling Dokter
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

// 4. Endpoint POST saat Pasien klik "Mulai Konsultasi"
app.post('/api/consultations', async (req, res, next) => {
  try {
    // Toleransi camelCase maupun snake_case
    const patientName = req.body.patientName || req.body.patient_name
    const roomCode = req.body.roomCode || req.body.room_code

    if (!patientName || !roomCode) {
      return res.status(400).json({ error: 'patientName/patient_name dan roomCode/room_code wajib diisi.' })
    }

    const { rows } = await pool.query(
      `INSERT INTO consultations (patient_name, room_code, status)
       VALUES ($1, $2, 'WAITING')
       ON CONFLICT (room_code) DO UPDATE SET status = 'WAITING'
       RETURNING *`,
      [patientName, roomCode]
    )
    const consultation = toConsultation(rows[0])
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
    res.json({ consultation })
  } catch (error) {
    next(error)
  }
})

app.post('/api/patients', async (req, res, next) => {
  try {
    const { name, medicalRecordNumber } = req.body
    const { rows } = await pool.query(
      'INSERT INTO patients (name, medical_record_number) VALUES ($1, $2) ON CONFLICT (medical_record_number) DO UPDATE SET name = $1 RETURNING *',
      [name, medicalRecordNumber]
    )
    res.status(201).json({ patient: rows[0] })
  } catch (error) {
    next(error)
  }
})

app.get('/api/patients', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM patients ORDER BY created_at DESC')
    res.json({ patients: rows })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error('[api]', error)
  res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan pada layanan konsultasi.' })
})

export default app
