
## Database Lokal
# SIPUSKES Depok
Skema PostgreSQL ada di `database/schema.postgres.sql`; data demo fiktif ada di `database/seed.postgres.sql`.

Demo sistem layanan kesehatan terintegrasi untuk UPTD Puskesmas Beji, Kota Depok. Panduan menjalankan dan skenario demo tersedia di [DEMO_GUIDE.md](./DEMO_GUIDE.md).

## PostgreSQL Lokal

Salin `.env.example` menjadi `.env`, lalu jalankan PostgreSQL dengan Docker Compose:

```sh
cp .env.example .env
docker compose up -d db
npm run db:init
```
Salin `.env.example` menjadi `.env`, lalu jalankan PostgreSQL dengan Docker Compose:
Skema PostgreSQL ada di `database/schema.sql`; data demo fiktif ada di `database/seed.sql`. Kredensial lokal ada di `.env` dan tidak masuk git. Database ini belum dihubungkan ke UI; halaman web masih menggunakan `localStorage` sampai backend API dibuat.

Untuk produksi, ganti kredensial bawaan, gunakan akses jaringan terbatas, dan siapkan autentikasi/otorisasi, backup, serta perlindungan data kesehatan. Jangan gunakan data seed atau akun demo untuk pasien nyata.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
Port host PostgreSQL adalah `5433` agar tidak berbenturan dengan server lokal yang memakai port standar `5432`. Tanpa Docker, PostgreSQL dapat dijalankan melalui Homebrew:

```sh
brew install postgresql@17
/opt/homebrew/opt/postgresql@17/bin/pg_ctl -D /opt/homebrew/var/postgresql@17 -o "-p 5433" -l /tmp/sipuskes-postgres.log start
/opt/homebrew/opt/postgresql@17/bin/psql -h /tmp -p 5433 -U "$USER" -d postgres -c "CREATE ROLE sipuskes LOGIN PASSWORD 'sipuskes_dev';"
/opt/homebrew/opt/postgresql@17/bin/createdb -h /tmp -p 5433 -U "$USER" --owner=sipuskes sipuskes
npm run db:init
```

Skema PostgreSQL ada di `database/schema.postgres.sql`; data demo fiktif ada di `database/seed.postgres.sql`. Kredensial lokal ada di `.env` dan tidak masuk git. Database ini belum dihubungkan ke UI; halaman web masih menggunakan `localStorage` sampai backend API dibuat.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
