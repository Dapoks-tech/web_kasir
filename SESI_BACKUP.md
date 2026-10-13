# Catatan Sesi & Panduan Lanjutan Hosting Web Kasir

Dokumen ini diperbarui untuk merangkum progres sesi terakhir dan langkah lanjutan.

---

## 1. Status Terakhir Proyek
- **Lokasi Lokal:** `D:\webkasir`
- **Repository GitHub:** [https://github.com/Dapoks-tech/web_kasir](https://github.com/Dapoks-tech/web_kasir) (branch `main`)
- **Backend Render:** `https://web-kasir-m58s.onrender.com` (Status: Live, Port: 10000)
- **Frontend Vercel:** `https://web-kasir-six.vercel.app` (Status: Live)
- **Database:** TiDB Cloud Serverless (schema `coffeeshop` sudah diinisialisasi via `backend/config/init.sql`)

---

## 2. Perubahan Kode yang Sudah di-Push ke GitHub
1. `backend/config/db.js`:
   - Penambahan opsi SSL default (`rejectUnauthorized: true`) untuk support TiDB Cloud Serverless.
2. `backend/routes/auth.js`:
   - Logging detail error (`err.code`, `err.message`, stack trace) pada endpoint `/api/auth/login`.

---

## 3. Masalah Terakhir yang Ditemukan (Kendala Login)
- Response saat login dari frontend:
  ```json
  {"message": "ECONNREFUSED"}
  ```
- **Penyebab:** Backend di Render mencoba terhubung ke `localhost:3306` atau host DB yang salah karena Environment Variables TiDB di dashboard Render belum terpasang/tersimpan dengan benar.

---

## 4. Rencana Tindakan untuk Sesi Berikutnya

### Langkah 1: Periksa & Simpan Environment Variables di Render
Buka Dashboard Render -> Pilih Web Service `web-kasir-m58s` -> Tab **Environment**. Pastikan variabel berikut terisi (ambil dari kredensial cluster TiDB Cloud Anda):

| Key | Value Contoh / Keterangan |
|---|---|
| `DB_HOST` | Host TiDB Cloud (misal: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`) |
| `DB_PORT` | `4000` |
| `DB_USER` | Username TiDB Cloud (misal: `xxxxxx.root`) |
| `DB_PASSWORD` | Password cluster TiDB Cloud Anda |
| `DB_NAME` | `coffeeshop` |
| `JWT_SECRET` | `coffeeshop_secret_key_2024` |
| `PORT` | `10000` |

Klik **Save Changes**. Render akan otomatis merestart service.

### Langkah 2: Uji Coba Login Ulang
Buka frontend di Vercel (`https://web-kasir-six.vercel.app/login`):
- Login Manager: `manager` / `admin123`
- Login Barista: `barista` / `barista123`

---

*File ini tersimpan di: `D:\webkasir\SESI_BACKUP.md`*
