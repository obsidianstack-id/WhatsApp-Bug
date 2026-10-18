# WA Report Desk

Dashboard Next.js untuk **mendokumentasikan dugaan pelanggaran WhatsApp** dan melacak catatan secara internal. Ini bukan alat untuk memblokir grup dan tidak mengirim laporan otomatis ke WhatsApp.

## Fitur
- Dashboard dark theme responsif.
- Validasi tautan undangan WhatsApp.
- Form kategori dan keterangan.
- API `GET/POST /api/reports`.
- Mode demo in-memory untuk pengujian lokal.
- Penyimpanan persisten opsional melalui Supabase.
- Status transparan: catatan belum dikirim ke WhatsApp.

## Prasyarat
- Node.js 18.17+ (disarankan versi LTS yang didukung Next.js).
- Akun GitHub, Vercel, dan (opsional) Supabase.

## Jalankan lokal
```bash
npm install
npm run dev
```
Buka `http://localhost:3000`. Tanpa Supabase, catatan hanya disimpan sementara dalam memori proses; jangan mengandalkannya untuk produksi.

## Aktifkan database Supabase
1. Buat proyek di Supabase.
2. Buka SQL Editor, lalu jalankan isi `supabase/schema.sql`.
3. Salin Project URL dan service-role key dari pengaturan API proyek.
4. Buat environment variables lokal dari `.env.example`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Jangan pernah menaruh service-role key dengan awalan `NEXT_PUBLIC_` atau mengunggah `.env` ke GitHub.
6. Restart `npm run dev`.

## Deploy melalui GitHub + Vercel
1. Buat repository baru di GitHub.
2. Unggah semua file proyek ini ke root repository.
3. Di Vercel, pilih **Add New → Project**, lalu impor repository tersebut.
4. Tambahkan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` pada Project Settings → Environment Variables. Opsional, tambahkan `REPORT_API_KEY` sebagai perlindungan tambahan untuk endpoint POST jika akan memanggil API dari klien khusus.
5. Deploy. Setelah menambahkan atau mengubah environment variables, lakukan redeploy.

## API
- `GET /api/reports`: daftar maksimal 100 catatan terbaru.
- `POST /api/reports` JSON:
```json
{
  "groupLink": "https://chat.whatsapp.com/example",
  "category": "Spam atau penipuan",
  "description": "Deskripsi dugaan pelanggaran dan bukti yang relevan."
}
```
Jika `REPORT_API_KEY` diatur, permintaan POST harus menyertakan header `x-report-api-key`. Jangan menyematkan secret ini dalam kode browser; untuk deployment publik, gunakan autentikasi server-side dan rate limiting sebelum membuka endpoint kepada pengguna umum.

## Batasan penting
- Tidak ada API publik yang menjamin penonaktifan grup berdasarkan tautan.
- WhatsApp menentukan apakah laporan memenuhi syarat untuk ditindaklanjuti.
- Gunakan fitur pelaporan resmi WhatsApp dan kirim hanya laporan yang jujur serta berbasis bukti.
- Untuk penggunaan publik, tambahkan login, rate limiting, retensi data, dan kontrol akses sebelum menyimpan informasi sensitif.
