# SIPUSKES Depok Demo

Aplikasi React + Vite dengan Tailwind CSS v4, Lucide React, Jitsi Meet External API, dan mock state browser. UI demo masih berjalan tanpa backend; database PostgreSQL tersedia terpisah dan belum terhubung ke halaman web.

## Menjalankan

```sh
cd app
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya `http://localhost:5173`.

Scaffold baru dengan `npm create vite@latest sipuskes -- --template react`, lalu jalankan `npm install lucide-react tailwindcss @tailwindcss/vite`. Tailwind v4 diaktifkan melalui plugin `@tailwindcss/vite` di `vite.config.js` dan `@import "tailwindcss"` di `src/index.css`.

## Akun Demo

- Nomor telepon: `0812 3456 7890`
- Nomor peserta: `00020268492`
- PIN pasien: `12345678`
- Kunci unik: `KEY-9F8A-7C2B`
- Admin: `admin@puskesmas.local` · PIN `87654321`
- Dokter: `dokter@puskesmas.local` · PIN `24681357`

Menu profil kanan atas membuka pengaturan, ubah PIN, login berdasarkan peran, dan pendaftaran pasien baru. PIN pasien harus tepat 8 angka dan dikonfirmasi ulang. Pendaftaran menghasilkan nomor peserta numerik serta kunci unik. NIK tidak diminta maupun disimpan.

Setelah login, pasien masuk ke beranda layanan; admin masuk ke **Dasbor Admin** dengan menu operasional dan analitik; dokter masuk ke **Dasbor Dokter** dengan agenda, antrean pasien, dan konsultasi virtual. Profil staf hanya menampilkan sesi staf serta tombol keluar.

## Alur Demo

- **Antrean:** daftar untuk hari ini atau besok, pilih poli, tenaga medis yang tersedia, jam 07.00–19.00, dan tulis keluhan. Tiket memuat dokter, keluhan, jumlah pasien di depan, serta estimasi tunggu.
- **Rekam medis:** riwayat kunjungan, hasil lab dummy, dan skrining digital yang tersimpan lokal.
- **Obat & apotek:** stok dummy, resep, aturan minum sebelum/sesudah makan, dan simulasi alarm/notifikasi.
- **Konsultasi virtual:** pasien memulai permintaan dari halaman pasien; permintaan dan keluhan muncul di inbox dokter. Tombol **Terima & hubungi** membuka room Jitsi yang sama pada sisi dokter. Jitsi Meet External API disematkan dalam modal; internet dan akses `meet.jit.si` diperlukan.
- **Fasilitas & jadwal:** jadwal dokter/tindakan serta kapasitas bed rawat inap dan IGD.
- **Admin:** analitik hanya muncul setelah login admin; admin dapat mengubah ketersediaan dokter hari ini/besok dan melihat tiket antrean beserta keluhan pasien.
- **Dasbor dokter:** menampilkan jadwal praktik, ringkasan antrean, pasien berikutnya, dan pintasan konsultasi. Daftar pasien tersedia di menu **Antrean dokter**.
- **Darurat:** tautan panggilan `119` dan surat rujukan digital demo untuk RSUI, RS Puri Cinere, RS Primaya Depok, RS Permata Depok, RSU Bunda Margonda, RSUD Khidmat Sehat Afiat (Kiari), RSU Bhakti Yudha, RS Bhayangkara Brimob, dan Brawijaya Hospital Depok.

## Batasan Demo

Jadwal, stok, antrean, kapasitas, dan analitik adalah data simulasi. Permintaan konsultasi memakai `localStorage` untuk demo pada browser/perangkat yang sama; perangkat pasien dan dokter yang berbeda tidak tersinkron tanpa backend bersama. Data tidak aman. Hash PIN hanya mendemokan alur, bukan autentikasi produksi. Jangan masukkan data pasien nyata. Jitsi menggunakan layanan publik dan bukan pengganti layanan gawat darurat.

Verifikasi: `npm run build` dan `npm run lint`.
