import { readFileSync } from 'node:fs'
import 'dotenv/config'
import pg from 'pg'

const { Client } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL belum diatur. Salin .env.example menjadi .env lalu jalankan PostgreSQL.')
}

const directory = new URL('.', import.meta.url)
const readSql = (name) => readFileSync(new URL(name, directory), 'utf8')
const sequenceTables = [
  'facilities', 'users', 'patients', 'staff', 'clinics', 'schedules', 'appointments', 'screenings',
  'visits', 'vitals', 'medicines', 'inventory_batches', 'prescriptions', 'prescription_items',
  'consultations', 'beds', 'audit_logs',
]
const client = new Client({ connectionString })
try {
  await client.connect()
  await client.query('BEGIN')
  await client.query(readSql('./schema.postgres.sql'))
  await client.query(readSql('./seed.postgres.sql'))

  for (const table of sequenceTables) {
    await client.query(`
      SELECT setval(pg_get_serial_sequence($1, 'id'), GREATEST(COALESCE(MAX(id), 1), 1), COUNT(*) > 0)
      FROM public.${table}
    `, [`public.${table}`])
  }

  const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
  await client.query('COMMIT')
  console.log(`Database PostgreSQL SIPUSKES siap (${rows[0].count} tabel).`)
} finally {
  await client.end()
}