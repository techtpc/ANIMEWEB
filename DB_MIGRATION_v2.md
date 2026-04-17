## DB Migration Notes (ANIMEWEB v2)

Dokumen ini menjelaskan cara memigrasikan data dari skema lama ke skema baru yang sudah Anda implementasikan via:
- `migrations-anime-episodes.sql`
- `supabase-rls-setup.sql`
- `SETUP_VIDEO_SERVERS_RLS.sql`

### Warning penting

Script `migrations-anime-episodes.sql` v2 melakukan `DROP TABLE` pada tabel lama seperti:
- `anime`
- `videos`
- `categories`, `tags`
- `video_categories`, `video_tags`
- `video_servers`

Jadi **data lama tidak otomatis tersisa**. Jika Anda ingin memindahkan data lama, lakukan backup/ekspor sebelum menjalankan migration v2.

### Tujuan skema baru

1. Filter berbasis **genre** (many-to-many `anime_genres`).
2. Ada 2 status: `ongoing` dan `completed`.
3. Anime `ongoing` punya `day_of_week` (0..6).
4. Episode (`public.videos`) menyimpan embed/download spesifik:
   - Server: `turbovip` dan `filedon`
   - Kualitas: `480` dan `720`

Field embed/download yang baru:
- `embed_url_turbovip_480`, `embed_url_turbovip_720`
- `embed_url_filedon_480`, `embed_url_filedon_720`
- `download_url_turbovip_480`, `download_url_turbovip_720`
- `download_url_filedon_480`, `download_url_filedon_720`

### 1) Backup data lama (disarankan)

Sebelum menjalankan migration v2:
- Ekspor/import manual tabel yang akan dipakai:
  - `anime` (id, title, slug, description, release_year, status, total_episodes)
  - `categories`, `video_categories`
  - `video_servers` (video_id, server_name, embed_url)
  - `videos` (episode_number, episode_title, duration_seconds, download_url, views, dll)

Cara cepat:
- Supabase Dashboard -> Table Editor -> Export data (CSV) untuk tabel-tabel di atas.

### 2) Migrasi Anime (metadata dasar)

Mapping:
- `anime.title` / `anime.slug` / `anime.description` / `release_year`: umumnya bisa langsung masuk.
- `anime.status` lama (mis. `ongoing`, `completed`, `upcoming`):
  - `completed` -> `completed`
  - `ongoing` -> `ongoing`
  - `upcoming` -> tentukan manual:
    - opsi 1: jadikan `ongoing` dengan `day_of_week` manual
    - opsi 2: jadikan `completed` jika memang sudah selesai

`day_of_week`:
- Skema lama **tidak memiliki** kolom ini.
- Jadi Anda perlu input manual untuk anime `ongoing`.

Validasi (contoh):
- Setelah data dimasukkan, pastikan:
  - `status='ongoing'` punya `day_of_week` (tidak null)
  - `status='completed'` boleh `day_of_week` null

### 3) Migrasi Genre (dari categories/tags lama)

Karena di v2 filter mengandalkan `genres` (dan Anda ingin `tags` serta `categories` dihapus), pendekatan yang paling aman:
- Ambil **himpunan categories yang dipakai oleh episode-episode** dari anime yang sama.

Langkah konsep:
1. Buat entri `genres` dari `categories` lama (ambil name/slug).
2. Buat relasi `anime_genres` dari anime -> genre:
   - sumber data: `video_categories` (video_id -> category_id)
   - ubah: `video_id` -> `anime_id` (pakai `videos.anime_id`)

Jika Anda juga ingin memakai `tags` lama sebagai genre:
- Anda perlu aturan tambahan karena `video_tags` bentuknya berbeda (dan di v2 Anda bilang hapus tags).

Rekomendasi:
- Start dari categories saja dulu (lebih konsisten dengan implementasi lama).

### 4) Migrasi Episode (`videos`)

Episode lama punya:
- `anime_id`, `episode_number`, `episode_title`, dll.
- embed berasal dari `video_servers`
- download umumnya ada 1 kolom: `videos.download_url` (belum per server/quality)

Di v2 episode harus punya 8 nilai:
- 4 embed (server x kualitas)
- 4 download (server x kualitas)

#### 4A) embed_url 480/720

Anda sebelumnya memilih skema URL terpisah (separate URLs).
Artinya:
- Anda perlu memastikan provider Anda benar-benar punya link khusus `480` dan `720`.

Jika Anda hanya punya 1 embed_url per server dari skema lama:
- v2 tidak bisa otomatis mengisi 480 vs 720 kecuali ada pola URL/parameter kualitas yang sama untuk keduanya.

#### 4B) download_url 480/720

Kasus serupa:
- jika download lama cuma 1 link, perlu manual input link untuk 480/720 dan server yang dipilih.

### 5) Contoh validasi cepat (SELECT)

1) Pastikan data anime terisi:
```sql
SELECT status, day_of_week, count(*) as total
FROM public.anime
GROUP BY status, day_of_week
ORDER BY status, day_of_week;
```

2) Pastikan episode punya embed/download yang tidak null:
```sql
SELECT
  count(*) AS episodes,
  sum((embed_url_turbovip_480 IS NOT NULL)::int) AS has_turbovip_480,
  sum((embed_url_turbovip_720 IS NOT NULL)::int) AS has_turbovip_720,
  sum((embed_url_filedon_480 IS NOT NULL)::int) AS has_filedon_480,
  sum((embed_url_filedon_720 IS NOT NULL)::int) AS has_filedon_720
FROM public.videos;
```

### 6) Checklist manual sebelum deploy

- Isi `day_of_week` untuk semua anime `ongoing`.
- Isi `anime_genres` untuk semua anime (minimal 1 genre).
- Isi untuk tiap episode:
  - `embed_url_*_480` dan `embed_url_*_720` (4 field)
  - `download_url_*_480` dan `download_url_*_720` (4 field)
- Cek halaman:
  - deskripsi anime
  - watch page untuk server + quality yang berbeda
  - tombol next/prev berdasarkan `episode_number`

