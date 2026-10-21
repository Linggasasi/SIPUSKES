import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? false : { rejectUnauthorized: false },
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
  // Kolom tambahan (aman dijalankan berulang)
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS member_id VARCHAR`)
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS complaint TEXT`)
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS clinic VARCHAR`)
  await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS doctor_name VARCHAR`)
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
    memberId: row.member_id || '',
    complaint: row.complaint || '',
    clinic: row.clinic || 'Poli Umum',
    doctor: row.doctor_name || 'dr. Aditya Pratama',
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
      `SELECT * FROM consultations
       WHERE status = 'WAITING'
          OR (status = 'ACTIVE' AND created_at > NOW() - INTERVAL '3 hours')
       ORDER BY created_at DESC`
    )
    res.set('Cache-Control', 'no-store')
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
    const memberId = req.body.memberId || null
    const complaint = req.body.complaint || null
    const clinic = req.body.clinic || null
    const doctorName = req.body.doctorName || null

    if (!patientName || !roomCode) {
      return res.status(400).json({ error: 'patientName/patient_name dan roomCode/room_code wajib diisi.' })
    }

    const { rows } = await pool.query(
      `INSERT INTO consultations (patient_name, room_code, status, member_id, complaint, clinic, doctor_name)
       VALUES ($1, $2, 'WAITING', $3, $4, $5, $6)
       ON CONFLICT (room_code) DO UPDATE SET status = 'WAITING'
       RETURNING *`,
      [patientName, roomCode, memberId, complaint, clinic, doctorName]
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
      `UPDATE consultations SET status = 'ACTIVE' WHERE id = $1 AND status IN ('WAITING', 'ACTIVE') RETURNING *`,
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

// Jalankan server sendiri hanya saat lokal; di Vercel app diekspor sebagai serverless function.
if (!process.env.VERCEL) {
  const port = Number(process.env.API_PORT) || 3001
  app.listen(port, () => console.log(`API SIPUSKES berjalan di http://localhost:${port}`))
}

export default app
