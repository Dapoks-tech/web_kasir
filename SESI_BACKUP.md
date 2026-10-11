# Catatan Sesi & Panduan Lanjutan Hosting Web Kasir

Dokumen ini mencakup ringkasan sesi pengembangan dan langkah-langkah yang perlu dilanjutkan saat sesi berikutnya.

---

## 1. Status Terakhir Proyek
- **Lokasi Lokal:** `D:\webkasir`
- **Repository GitHub:** [https://github.com/Dapoks-tech/web_kasir](https://github.com/Dapoks-tech/web_kasir) (sudah di-push branch `main`)
- **Frontend Config:** 
  - Sudah mendukung environment variable `VITE_API_URL`
  - Dilengkapi `vercel.json` untuk SPA routing
  - Port lokal diatur ke `3000` dengan `host: true`
- **Akun Pengguna yang Tersedia (Local Database):**
  - **Manager:** username `manager` | password `admin123`
  - **Barista:** username `barista` | password `barista123`

---

## 2. Rencana Hosting (Opsi 1: Free Tier)
- **Database:** TiDB Cloud Serverless (MySQL)
- **Backend:** Render.com (Web Service)
- **Frontend:** Vercel (SPA React Vite)

---

## 3. Langkah Selanjutnya Saat Melanjutkan

### A. Database (TiDB Cloud)
1. Buat Serverless Cluster di [TiDB Cloud](https://tidbcloud.com) (Region Singapore).
2. Simpan kredensial:
   - `Host`
   - `Port` (biasanya 4000)
   - `User`
   - `Password`
   - `Database Name` (`coffeeshop`)
3. Buka **SQL Editor** / **Chat2Query** di TiDB Cloud, jalankan script dari `backend/config/init.sql`.

### B. Backend (Render.com)
1. Buka [Render.com](https://render.com), hubungkan repo `Dapoks-tech/web_kasir`.
2. Buat **Web Service**:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Tambahkan **Environment Variables**:
   - `DB_HOST` = (dari TiDB)
   - `DB_PORT` = `4000` (atau sesuai TiDB)
   - `DB_USER` = (dari TiDB)
   - `DB_PASSWORD` = (dari TiDB)
   - `DB_NAME` = `coffeeshop`
   - `JWT_SECRET` = `coffeeshop_secret_key_2024`
   - `PORT` = `5000`
4. Dapatkan URL backend Render (contoh: `https://webkasir-backend.onrender.com`).

### C. Frontend (Vercel)
1. Buka [Vercel.com](https://vercel.com), import repo `Dapoks-tech/web_kasir`.
2. Edit **Root Directory** ke: `frontend`.
3. Tambahkan **Environment Variable**:
   - `VITE_API_URL` = `<URL-Backend-Render>/api` (contoh: `https://webkasir-backend.onrender.com/api`)
4. Klik **Deploy**.

---

*File ini tersimpan di: `D:\webkasir\SESI_BACKUP.md`*
