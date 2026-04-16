# Setup Episode & Anime System - Step by Step

## ✅ Yang Sudah Dilakukan

1. ✅ Hapus query `studios` dari semua halaman dan components
2. ✅ Buat tipe data baru: `Anime` dan `Episode`
3. ✅ Buat queries baru untuk anime dan episodes
4. ✅ Buat halaman detail anime (`/anime/[animeId]`)
5. ✅ Buat halaman watch dengan pilih resolusi (`/watch/[episodeId]`)
6. ✅ Update component AnimeCard untuk link ke anime detail

## 🔧 Setup yang Perlu Dilakukan di Supabase

### 1️⃣ Jalankan SQL Migration

Buka **Supabase Dashboard → SQL Editor** dan copy-paste query ini:

```sql
-- Create anime table (group untuk episodes)
CREATE TABLE IF NOT EXISTS public.anime (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  thumbnail_url VARCHAR,
  description TEXT,
  release_year INTEGER,
  status VARCHAR DEFAULT 'ongoing', -- ongoing, completed, upcoming
  total_episodes INTEGER DEFAULT 0,
  categories TEXT[], -- array of category ids
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Modify videos table to support episodes
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS anime_id UUID;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS episode_number INTEGER;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS episode_title VARCHAR;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS season_number INTEGER DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE public.videos
  ADD CONSTRAINT fk_videos_anime
  FOREIGN KEY (anime_id) REFERENCES public.anime(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_anime_id ON public.videos(anime_id);
CREATE INDEX IF NOT EXISTS idx_videos_episode_number ON public.videos(episode_number);

-- Enable RLS for anime table
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;

-- Add read policy for anime
CREATE POLICY "Allow public read on anime" ON public.anime FOR SELECT USING (true);

-- Insert your One Piece anime
INSERT INTO public.anime (title, slug, description, release_year, status, total_episodes)
VALUES (
  'One Piece',
  'one-piece',
  'Mengikuti petualangan Monkey D. Luffy dalam mencari One Piece Treasure',
  1999,
  'ongoing',
  1
) ON CONFLICT (slug) DO NOTHING;
```

### 2️⃣ Link Video One Piece ke Anime

Setelah jalankan SQL, Anda perlu mengupdate video One Piece yang sudah ada untuk link ke anime One Piece:

```sql
-- Dapatkan ID anime One Piece
SELECT id FROM public.anime WHERE slug = 'one-piece';

-- Copy ID tersebut dan update video dengan query ini:
UPDATE public.videos
SET
  anime_id = '[ID_DARI_ANIME]',
  episode_number = 1,
  episode_title = 'The Man Who Will Become the Pirate King'
WHERE id = '[VIDEO_ID_ANDA]';
```

Atau lebih simple, gunakan UI Supabase:

1. Buka Table **anime** - klik row "One Piece" - copy ID
2. Buka Table **videos** - klik video One Piece
3. Edit field: `anime_id`, `episode_number`, `episode_title`

### 3️⃣ Verify Data

Buka halaman `/debug` yang sebelumnya, tambah test query untuk anime table:

```
GET /debug → cek apakah anime table sudah ada dan terisi
```

## 🚀 Alur Penggunaan

### Scenario: User Melihat Video One Piece

1. **Halaman Utama** (`/`)
   - User lihat thumbnail One Piece di grid atau Top 10
   - Click thumbnail → ke halaman detail anime

2. **Halaman Detail Anime** (`/anime/[animeId]`)
   - User lihat info anime (judul, tahun, status, genre)
   - User lihat daftar episodes di bawah
   - Click episode → ke halaman watch

3. **Halaman Watch** (`/watch/[episodeId]`)
   - Lihat video player embed
   - Pilih resolusi (360p, 480p, 720p, 1080p)
   - Pilih server (jika ada multiple)
   - Klik Back untuk balik ke detail anime

## 🎬 Menambah Episode Baru untuk Anime

### Admin Panel Flow:

1. **Ke `/admin/videos/new`**
   - Isi form dengan:
     - Title: "One Piece Episode 2"
     - Thumbnail URL
     - Duration
     - Release Year
     - Kategori/Tags
2. **Form ini akan auto-save ke `videos` table**
3. **Setelah save, edit manual di Supabase atau update admin form**
   - Set `anime_id` ke ID One Piece
   - Set `episode_number` = 2
   - Set `episode_title` = "Episode Title"

### Query untuk Update Manual:

```sql
UPDATE public.videos
SET
  anime_id = '[ONE_PIECE_ANIME_ID]',
  episode_number = 2
WHERE id = '[NEW_VIDEO_ID]';
```

## 🗂️ File Structure yang Baru

```
src/
├── app/
│   ├── page.tsx
│   ├── debug/
│   │   └── page.tsx
│   ├── anime/
│   │   └── [animeId]/
│   │       └── page.tsx        # ✨ NEW: Detail anime + episode list
│   ├── watch/
│   │   └── [episodeId]/
│   │       └── page.tsx        # ✨ NEW: Watch page dengan resolution select
│   └── ...
├── lib/
│   ├── queries.ts              # ✨ UPDATED: Anime & Episode queries
│   └── admin-queries.ts
├── components/
│   └── AnimeCard.tsx           # ✨ UPDATED: Link ke anime detail
└── types/
    └── index.ts                # ✨ UPDATED: Anime & Episode types
```

## 🧪 Testing

1. **Run app:** `npm run dev`
2. **Test homepage:** `http://localhost:3000`
   - Klik thumbnail One Piece → ke `/anime/[id]`
3. **Test anime detail:** `http://localhost:3000/anime/[one-piece-id]`
   - Lihat episode list
   - Klik episode → ke `/watch/[episode-id]`
4. **Test watch page:** Lihat resolusi options, server options

## ⚡ Next Steps (Optional)

1. **Improve Admin Form:**
   - Tambah field `anime_id`, `episode_number` di VideoForm
   - Dropdown untuk select anime
   - Auto-populate episode number

2. **Batch Episode Upload:**
   - Import CSV untuk multiple episodes

3. **Episode Number Generation:**
   - Auto-assign episode number based on anime

## 📝 Troubleshooting

**Q: Video tidak muncul di anime detail?**

- A: Pastikan `anime_id` di video table sudah di-set dengan benar

**Q: Watch page blank?**

- A: Pastikan `video_servers` table sudah punya data embed_url

**Q: Refresh error RLS?**

- A: Pastikan RLS policies sudah di-setup untuk anime table
