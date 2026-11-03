# 👑 Bedcover Susah Bangun - Luxury E-Catalog

Web E-Catalog Eksklusif untuk brand **"Bedcover Susah Bangun"** bertema **Luxury Gold & Obsidian Black**. Dibuat dengan **HTML, CSS, JavaScript, dan PHP Native**, mendukung arsitektur database realtime **Google Sheets API v4** dan penyimpanan media **Google Drive API v3** (menggunakan OAuth 2.0 User Credentials tanpa Service Account), serta siap di-deploy ke **Vercel Serverless**.

---

## ✨ Fitur-Fitur Utama

1. **Halaman Utama sebagai List Category Eksklusif**:
   - Menampilkan grid kategori mewah lengkap dengan **Foto Cover Kategori, Nama Kategori, Deskripsi, dan Jumlah Koleksi Produk**.
   - Ketika kategori di-klik, sistem otomatis memfilter dan menampilkan daftar produk sesuai kategori tersebut secara dinamis.
   - Dilengkapi banner filter aktif dan tombol *"Tampilkan Semua Kategori"* untuk kembali ke tampilan awal.

2. **Halaman & Fitur Search Instan**:
   - Tombol pencarian di header dan bilah pencarian interaktif.
   - Pencarian real-time langsung saat mengetik (mencari nama produk, jenis bahan seperti *Tencel, Katun Jepang, Sutra*, deskripsi, atau ukuran).
   - Tag pencarian cepat untuk memudahkan pembeli menemukan bahan favorit.

3. **Katalog Produk Dinamis & Interaktif**:
   - Kartu produk mewah dengan indikator titik galeri foto, badge status (*Ready Stock* / *Pre-Order*), harga berformat Rupiah, dan tag kategori.
   - Indikator video jika produk memiliki video showcase.

4. **Modal Detail Produk di Tengah Halaman**:
   - Muncul di tengah layar dengan animasi smooth dan latar belakang gelap mewah.
   - Galeri foto interaktif (foto utama resolusi tinggi + deretan thumbnail yang dapat di-klik).
   - Pemutar video produk (jika produk menyertakan video).
   - Informasi detail spesifikasi bahan, ukuran kasur (King 180x200, Super King 200x200, Queen 160x200), dan isi kelengkapan paket.
   - **Tombol WhatsApp Auto-Chat**:
     - Tombol langsung terhubung ke nomor WhatsApp layanan dengan pesan otomatis yang rapi menanyakan ketersediaan barang beserta ukuran pilihan, link foto dan katalog produk.

5. **Tombol Sticky Social Media (Instagram & WhatsApp)**:
   - Tombol melayang (*sticky floating buttons*) di sudut layar yang selalu mudah dijangkau pembeli di perangkat HP maupun Laptop.

6. **Fitur Love / Wishlist (Tersimpan di Browser)**:
   - Pengunjung dapat menyukai (*love*) produk favorit mereka tanpa perlu registrasi atau login.
   - Data otomatis tersimpan di `LocalStorage` browser.
   - Tombol header dengan badge penghitung favorit untuk menampilkan produk-produk yang disukai kapan saja.

7. **Hero Promo Banner Slider**:
   - Banner berjalan (*carousel*) di bagian atas halaman dengan judul, subjudul, dan tombol CTA.
   - Dapat diatur aktif/non-aktif dari panel admin.

8. **Panel Admin Lengkap (`/admin`)**:
   - Login aman dengan session PHP.
   - **Manajemen Produk**: Tambah produk, edit produk, upload banyak foto sekaligus, upload video.
   - **Fitur Duplikat / Copy Produk**: Duplikasi produk dalam 1 klik sehingga admin hanya perlu mengganti nama dan foto tanpa mengetik ulang deskripsi dari awal.
   - **Manajemen Kategori**: Tambah kategori baru lengkap dengan upload foto cover, ubah nama, dan hapus kategori.
   - **Manajemen Banner Promo**: Tambah, edit, dan hapus banner promo.
   - **Pengaturan Brand & Kontak**: Ubah logo web, nama brand, tagline, nomor WhatsApp, Instagram, alamat galeri, dan jam buka.
   - **Pembersihan Otomatis Google Drive**: Saat foto/video produk, banner, atau logo diganti atau dihapus, file lama di Google Drive otomatis dihapus secara permanen sehingga tidak memenuhi ruang Drive Anda.
   - **Uji Koneksi Google**: Tombol diagnosis untuk memeriksa status sambungan ke Google Sheets & Google Drive.

---

## 📁 Struktur Direktori

```
bedcover/
├── .env                     # File konfigurasi utama (Kredensial Google & Info Brand)
├── .env.example             # Template konfigurasi
├── .gitignore               # Aturan pengabaian file Git
├── vercel.json              # Konfigurasi deployment Vercel Serverless
├── README.md                # Dokumentasi lengkap
├── index.php                # Halaman utama e-catalog publik
├── admin/
│   ├── login.php            # Halaman login admin
│   ├── index.php            # Dashboard manajemen admin
│   └── logout.php           # Proses logout admin
├── api/
│   ├── products.php         # REST API CRUD produk
│   ├── settings.php         # REST API kategori, banner & kontak
│   ├── upload.php           # Upload foto & video (Drive v3 / local fallback)
│   ├── image.php            # Streaming proxy foto Drive (bypass hotlinking 429)
│   └── check-connection.php # Diagnosa koneksi Google API
├── assets/
│   ├── css/
│   │   ├── style.css        # CSS Luxury Gold & Obsidian Black tema publik
│   │   └── admin.css        # CSS Dashboard admin
│   ├── js/
│   │   ├── app.js           # Logika interaktif katalog publik & modal
│   │   └── admin.js         # Logika dashboard admin & upload
│   └── images/
│       └── logo.svg         # Logo vector luxury Bedcover Susah Bangun
├── config/
│   ├── env.php              # Parser .env otomatis
│   └── app.php              # Helper global (Rupiah, URL WA, Image Proxy, Cleanup)
├── data/
│   ├── products.json        # Data produk bawaan (Fallback lokal)
│   ├── settings.json        # Pengaturan & kategori bawaan (Fallback lokal)
│   └── google_token_cache.json # Cache token akses OAuth 2.0 (dibuat otomatis)
├── includes/
│   ├── Auth.php             # Autentikasi sesi admin
│   ├── GoogleClient.php     # Client OAuth2 Google Sheets API v4 & Drive API v3
│   ├── ProductRepository.php# Repository produk (Sheets & Local fallback)
│   └── SettingsRepository.php# Repository kategori, banner & kontak
└── uploads/                 # Folder penyimpanan fallback jika lokal
```

---

## 🚀 Cara Menjalankan Secara Lokal

Website ini dirancang **langsung dapat dijalankan tanpa perlu setup database apapun**, karena telah dilengkapi dataset bawaan di `data/products.json` dan `data/settings.json`.

1. Buka Terminal dan masuk ke folder `bedcover`:
   ```bash
   cd "/Users/razaq/Documents/Project/folder tanpa judul/bedcover"
   ```

2. Jalankan server lokal bawaan PHP dengan router:
   ```bash
   php -S localhost:8000 router.php
   ```

3. Buka browser:
   - **Katalog Publik**: [http://localhost:8000](http://localhost:8000)
   - **Panel Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)
     - Username: `admin`
     - Password: `password123`

---

## ☁️ Integrasi Google Sheets API & Google Drive API (OAuth 2.0)

Jika Anda ingin menghubungkan data ke Google Spreadsheet dan foto ke Google Drive (tanpa Service Account), cukup isi file `.env` di folder `bedcover`:

```env
# 1. Kredensial OAuth 2.0 dari Google Cloud Console
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# 2. Refresh Token dari OAuth 2.0 Playground
GOOGLE_REFRESH_TOKEN="1//04xxxx"

# 3. ID Spreadsheet Google Anda
GOOGLE_SPREADSHEET_ID="1Zd3521o2K2w7fxaXp4iMgt0sXXKxU52qV3Mse01S3Ks"
GOOGLE_SPREADSHEET_SHEET_NAME="Products"

# 4. ID Folder Google Drive untuk menyimpan foto/video
GOOGLE_DRIVE_FOLDER_ID="1Z20zz6hy_AOMh8pc4KRcexgeWD2bRv6f"
```

### Langkah Mendapatkan Kredensial:
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru.
2. Aktifkan **Google Sheets API** dan **Google Drive API**.
3. Di menu **APIs & Services > Credentials**, buat **OAuth Client ID** tipe *Web Application*. Masukkan `https://developers.google.com/oauthplayground` di kolom *Authorized redirect URIs*.
4. Buka [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):
   - Klik ikon gerigi (kanan atas), centang *Use your own OAuth credentials*, lalu masukkan Client ID & Client Secret Anda.
   - Di panel kiri, pilih scope:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive`
   - Klik **Authorize APIs**, login dengan akun Google Anda.
   - Klik **Exchange authorization code for tokens**, salin nilai **Refresh token** ke file `.env`.
5. Buat Spreadsheet baru di Google Sheets, salin ID dari URL-nya ke `GOOGLE_SPREADSHEET_ID`.
6. Buat Folder baru di Google Drive, salin ID dari URL-nya ke `GOOGLE_DRIVE_FOLDER_ID`.

---

## 🌐 Deploy ke Vercel lewat GitHub

Aplikasi ini sudah 100% kompatibel dengan arsitektur serverless Vercel (Front controller `api/index.php`, runtime `vercel-php@0.7.3`, clean URLs tanpa `.php`, signed cookie token untuk auth serverless, dan token cache di `/tmp`).

### Langkah Push ke GitHub & Hubungkan ke Vercel:

1. Inisialisasi Git di folder `bedcover` (jika belum):
   ```bash
   cd "/Users/razaq/Documents/Project/folder tanpa judul/bedcover"
   git init
   git add .
   git commit -m "feat: initial commit Bedcover Susah Bangun with Vercel serverless support"
   ```

2. Buat repository baru di GitHub (misal `bedcover`), lalu hubungkan remote dan push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME/bedcover.git
   git push -u origin main
   ```

3. Di dashboard Vercel ([vercel.com](https://vercel.com)):
   - Klik **Add New Project** > pilih repository `bedcover`.
   - Di bagian **Environment Variables**, tambahkan kredensial:
     - `ADMIN_USERNAME`: `admin`
     - `ADMIN_PASSWORD`: `password123`
     - `GOOGLE_CLIENT_ID`: `(Client ID Anda)`
     - `GOOGLE_CLIENT_SECRET`: `(Client Secret Anda)`
     - `GOOGLE_REFRESH_TOKEN`: `(Refresh Token Anda)`
     - `GOOGLE_SPREADSHEET_ID`: `(ID Spreadsheet Anda)`
     - `GOOGLE_SPREADSHEET_SHEET_NAME`: `Products`
     - `GOOGLE_DRIVE_FOLDER_ID`: `(ID Folder Drive Anda)`
     - `WHATSAPP_NUMBER`: `(Nomor WA diawali 62)`
   - Klik **Deploy**.


