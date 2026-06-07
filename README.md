
## Database Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**.
3. Jalankan isi file `supabase/schema.sql`.
4. Ambil PostgreSQL connection string dari **Project Settings > Database**.
5. Untuk Vercel, gunakan pooled connection string dan pastikan ada `sslmode=require`.

Schema membuat tabel:

- `users`: menyimpan identitas akun X.
- `votes`: menyimpan vote dengan `x_user_id unique`.
- enum `vote_choice`: `agree` atau `disagree`.

## Konfigurasi X Developer

1. Masuk ke X Developer Portal dan buat Project/App.
2. Aktifkan OAuth 2.0 untuk Web App.
3. Tambahkan callback URL lokal:

```txt
http://localhost:3000/api/auth/callback/twitter
```

4. Setelah deploy, tambahkan callback URL production:

```txt
https://domain-kamu.vercel.app/api/auth/callback/twitter
```

5. Isi Website URL sesuai domain aplikasi.
6. Salin **Client ID** dan **Client Secret** ke `.env.local`.

## Environment Local

Copy `.env.example` menjadi `.env.local`, lalu isi nilainya:

```bash
X_CLIENT_ID=
X_CLIENT_SECRET=
NEXTAUTH_SECRET=buat_secret_panjang_random
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
DATABASE_SSL=true
```

Untuk membuat secret:

```bash
openssl rand -base64 32
```

Jika tidak ada OpenSSL, gunakan generator secret aman lain. Jangan commit `.env.local`.

## Menjalankan Project

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Deploy ke Vercel

1. Push folder project ini ke GitHub.
2. Buka Vercel, pilih **Add New Project**, lalu import repo GitHub.
3. Framework akan terdeteksi sebagai Next.js.
4. Tambahkan environment variables di Vercel:

```txt
X_CLIENT_ID
X_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL=https://domain-kamu.vercel.app
DATABASE_URL
DATABASE_SSL=true
```

5. Deploy.
6. Masuk lagi ke X Developer Portal dan tambahkan callback URL production:

```txt
https://domain-kamu.vercel.app/api/auth/callback/twitter
```

7. Redeploy jika environment variable atau callback berubah.

## Catatan Security

- Tidak ada dummy akun, test akun, localStorage, sessionStorage, atau data sementara.
- `x_user_id` dari X dipakai sebagai identitas unik.
- Validasi usia akun dilakukan saat login dan dicek ulang saat submit vote.
- Submit vote hanya lewat API route server.
- Duplicate vote dicegah oleh unique constraint di database dan ditangani dengan pesan `Kamu sudah voting.`
- Secret hanya dibaca di server melalui environment variables.
