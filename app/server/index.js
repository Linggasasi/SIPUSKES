import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { URL } from 'node:url'
import 'dotenv/config'
import pg from 'pg'
import { WebSocketServer, WebSocket } from 'ws'

const { Pool } = pg
const hasSsl = typeof process.env.DATABASE_URL === 'string' && /sslmode=require/i.test(process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: hasSsl ? { rejectUnauthorized: false } : false,
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

const consultationSelect = `
  SELECT
    consultation.id,
    consultation.provider_id,
    consultation.room_code,
    consultation.complaint,
    consultation.status,
    consultation.requested_at,
    patient.full_name AS patient_name,
    patient.member_number,
    clinic.name AS clinic_name,
    COALESCE(provider.display_name, 'Dokter belum ditentukan') AS provider_name
  FROM consultations AS consultation
  JOIN patients AS patient ON patient.id = consultation.patient_id
    LEFT JOIN clinics AS clinic ON clinic.id = consultation.clinic_id
  LEFT JOIN staff AS provider ON provider.id = consultation.provider_id
`

function toConsultation(row) {
  if (!row) return null
  return {
    id: String(row.id),
    providerId: row.provider_id,
    room: row.room_code,
    patient: row.patient_name,
    memberId: row.member_number,
    doctor: row.provider_name,
    clinic: row.clinic_name || 'Poli Umum',
    complaint: row.complaint,
    createdAt: new Date(row.requested_at).toISOString(),
    status: row.status === 'waiting' ? 'Menunggu dokter' : row.status === 'in_progress' ? 'Sedang berlangsung' : 'Selesai',
  }
}

async function getConsultation(id) {
  const { rows } = await pool.query(`${consultationSelect} WHERE consultation.id = $1`, [id])
  return toConsultation(rows[0])
}

async function getDoctorId(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) throw Object.assign(new Error('Email akun dokter wajib diberikan.'), { status: 400 })
  const { rows } = await pool.query(
    `SELECT staff.id
     FROM staff
     JOIN users AS user_account ON user_account.id = staff.user_id
     WHERE LOWER(user_account.email) = $1
       AND user_account.role = 'doctor'
       AND user_account.is_active = TRUE
     LIMIT 1`,
    [normalizedEmail],
  )
  if (!rows.length) throw Object.assign(new Error('Akun dokter tidak ditemukan atau tidak aktif.'), { status: 403 })
  return rows[0].id
}

function notifyDoctor(type, consultation, providerId) {
  const message = JSON.stringify({ type, consultation })
  for (const socket of webSockets.clients) {
    if (socket.readyState === WebSocket.OPEN && socket.role === 'doctor' && socket.providerId === providerId) {
      socket.send(message)
    }
  }
}

async function ensureClient(client, input) {
  const memberNumber = String(input.memberNumber || '').trim()
  const fullName = String(input.patientName || '').trim()
  const phone = String(input.phone || '').replace(/\D/g, '')
  if (!memberNumber || !fullName || !phone) {
    throw Object.assign(new Error('Nomor peserta, nama pasien, dan nomor telepon wajib diisi.'), { status: 400 })
  }

  const existingPatient = await client.query(
    `SELECT patient.id, user_account.phone
     FROM patients AS patient
     JOIN users AS user_account ON user_account.id = patient.user_id
     WHERE patient.member_number = $1
     FOR UPDATE OF patient`,
    [memberNumber],
  )
  if (existingPatient.rowCount) {
    const storedPhone = String(existingPatient.rows[0].phone || '').replace(/\D/g, '')
    if (storedPhone && storedPhone !== phone) {
      throw Object.assign(new Error('Nomor peserta tidak cocok dengan nomor telepon akun.'), { status: 403 })
    }
    return existingPatient.rows[0].id
  }

  const phoneOwner = await client.query(
    `SELECT user_account.id, patient.member_number
     FROM users AS user_account
     LEFT JOIN patients AS patient ON patient.user_id = user_account.id
     WHERE user_account.phone = $1
     FOR UPDATE OF user_account`,
    [phone],
  )
  if (phoneOwner.rowCount && phoneOwner.rows[0].member_number) {
    throw Object.assign(new Error('Nomor telepon tersebut sudah terhubung ke peserta lain.'), { status: 409 })
  }

  let userId = phoneOwner.rows[0]?.id
  if (!userId) {
    const user = await client.query(
      "INSERT INTO users (role, phone) VALUES ('patient', $1) RETURNING id",
      [phone],
    )
    userId = user.rows[0].id
  }

  const patient = await client.query(
    `INSERT INTO patients (user_id, member_number, full_name, birth_date, gender, blood_type, address, emergency_phone, service_scheme)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [userId, memberNumber, fullName, input.birthDate || null, input.gender || null, input.bloodType || null, input.address || null, input.emergencyPhone || null, input.serviceScheme || 'subsidi'],
  )
  return patient.rows[0].id
}

async function createConsultation(input) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const patientId = await ensureClient(client, input)
    const clinicResult = await client.query(
      'SELECT id FROM clinics WHERE name = $1 AND is_active = TRUE ORDER BY id LIMIT 1',
      [String(input.clinic || 'Poli Umum')],
    )
    const clinicId = clinicResult.rows[0]?.id
    if (!clinicId) throw Object.assign(new Error('Poli yang dipilih tidak ditemukan.'), { status: 400 })

    const providerResult = await client.query(
      `SELECT staff.id
       FROM staff
       JOIN users AS user_account ON user_account.id = staff.user_id
       WHERE staff.display_name = $1
         AND user_account.role = 'doctor'
         AND user_account.is_active = TRUE
       LIMIT 1`,
      [String(input.doctor || '')],
    )
    const providerId = providerResult.rows[0]?.id
    if (!providerId) throw Object.assign(new Error('Dokter yang dipilih tidak ditemukan atau tidak aktif.'), { status: 400 })
    const facilityResult = await client.query('SELECT id FROM facilities ORDER BY id LIMIT 1')
    const facilityId = facilityResult.rows[0]?.id
    if (!facilityId) throw new Error('Data fasilitas belum tersedia. Jalankan npm run db:init.')

    const complaint = String(input.complaint || '').trim()
    if (!complaint) throw Object.assign(new Error('Keluhan konsultasi wajib diisi.'), { status: 400 })
    const roomCode = String(input.room_code || `SIPUSKES-Konsultasi-${input.memberNumber || randomUUID()}`)
    const result = await client.query(
      `INSERT INTO consultations (patient_id, provider_id, clinic_id, room_code, complaint, status)
       VALUES ($1, $2, $3, $4, $5, 'waiting')
       RETURNING id`,
      [patientId, providerId, clinicId, roomCode, complaint],
    )
    await client.query('COMMIT')
    return await getConsultation(result.rows[0].id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'postgresql' })
  } catch (error) {
    res.status(500).json({ ok: false, database: 'postgresql', error: error.message })
  }
})

app.get('/api/consultations', async (req, res, next) => {
  try {
    const providerId = await getDoctorId(req.query.email)
    const { rows } = await pool.query(
      `${consultationSelect}
       WHERE consultation.provider_id = $1
         AND consultation.status IN ('waiting', 'in_progress')
       ORDER BY consultation.requested_at DESC`,
      [providerId],
    )
    res.json({ consultations: rows.map(toConsultation) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/consultations', async (req, res, next) => {
  try {
    const consultation = await createConsultation(req.body)
    notifyDoctor('consultation.created', consultation, consultation.providerId)
    res.status(201).json({ consultation })
  } catch (error) {
    next(error)
  }
})

app.patch('/api/consultations/:id/accept', async (req, res, next) => {
  try {
    const providerId = await getDoctorId(req.query.email)
    const { rows } = await pool.query(
      `UPDATE consultations
       SET status = 'in_progress', started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
       WHERE id = $1 AND provider_id = $2 AND status IN ('waiting', 'in_progress')
       RETURNING id`,
      [req.params.id, providerId],
    )
    if (!rows.length) return res.status(404).json({ error: 'Permintaan konsultasi tidak ditemukan atau sudah selesai.' })
    const consultation = await getConsultation(rows[0].id)
    notifyDoctor('consultation.updated', consultation, providerId)
    res.json({ consultation })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error('[api]', error)
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Terjadi kesalahan pada layanan konsultasi.' })
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
  getDoctorId(url.searchParams.get('email')).then((providerId) => {
    webSockets.handleUpgrade(request, socket, head, (client) => {
      client.role = 'doctor'
      client.providerId = providerId
      webSockets.emit('connection', client)
    })
  }).catch(() => socket.destroy())
})

webSockets.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connected' }))
})

pool.on('error', (error) => console.error('[postgres]', error))

server.listen(port, '0.0.0.0', () => console.log(`SIPUSKES Express API + WebSocket berjalan di http://0.0.0.0:${port}`))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close()
    webSockets.close()
    pool.end().finally(() => process.exit(0))
  })
}
