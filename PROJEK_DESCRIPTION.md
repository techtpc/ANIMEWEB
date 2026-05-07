# ANIMEWEB - Platform Streaming Anime

## 📋 Overview

ANIMEWEB adalah platform streaming anime modern yang dibangun dengan teknologi web terbaru. Website ini terinspirasi dari Samehadaku dengan fitur lengkap untuk menonton anime online, mencari anime berdasarkan kategori, dan panel admin untuk mengelola konten.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.3 (App Router)
- **Frontend**: React 19.2.4
- **Styling**: Tailwind CSS 4 + PostCSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Language**: TypeScript 5
- **Linting**: ESLint 9 + eslint-config-next

## ✨ Fitur Utama

### Public Pages
1. **Homepage** (`/`)
   - Anime terbaru ongoing
   - Anime completed
   - Grid layout responsif (3-6 kolom)

2. **Anime Detail** (`/anime/[slug]`)
   - Informasi lengkap anime
   - Episode list
   - Genre & tags

3. **Watch Episode** (`/watch/[episodeId]`)
   - Video player dengan multiple server
   - Kualitas 480p & 720p
   - Download links
   - Episode navigation

4. **Categories** (`/categories` & `/categories/[slug]`)
   - Browse anime by category/genre
   - Filter dan sorting

5. **Search** (`/search`)
   - Pencarian anime real-time

6. **Ongoing & Completed** (`/ongoing`, `/completed`)
   - Anime berdasarkan status
   - Pagination support

7. **Jadwal Rilis** (`/jadwal-rilis`)
   - Schedule anime yang akan tayang

8. **Tags** (`/tags`)
   - Browse by tags

### Admin Dashboard (`/admin`)
1. **Dashboard Utama**
   - Statistik ringkasan
   - Quick actions
   - Sidebar navigation

2. **Manajemen Video** (`/admin/videos`)
   - List semua video/episode
   - Tambah video baru
   - Edit & hapus video
   - Thumbnail preview

3. **Manajemen Kategori** (`/admin/categories`)
   - CRUD kategori/genre
   - Auto-generate slug

4. **Manajemen Tags** (`/admin/tags`)
   - CRUD tags
   - Visual tag badges

## 🗂️ Struktur Project

```
ANIMEWEB/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── anime/[slug]/      # Anime detail
│   │   ├── watch/[episodeId]/ # Watch page
│   │   ├── categories/        # Categories pages
│   │   ├── search/            # Search page
│   │   ├── ongoing/           # Ongoing anime
│   │   ├── completed/         # Completed anime
│   │   ├── jadwal-rilis/      # Release schedule
│   │   ├── tags/              # Tags pages
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── videos/
│   │   │   ├── categories/
│   │   │   └── tags/
│   │   ├── api/               # API routes
│   │   │   └── admin/
│   │   ├── robots.ts          # SEO robots
│   │   └── sitemap.ts         # SEO sitemap
│   ├── components/            # React components
│   │   ├── AnimeCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── EpisodeList.tsx
│   │   ├── SearchBox.tsx
│   │   ├── PublicNavbar.tsx
│   │   └── admin/
│   │       ├── VideoForm.tsx
│   │       └── EpisodeAnimeForm.tsx
│   ├── lib/                   # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── queries.ts        # Public queries
│   │   └── admin-queries.ts  # Admin queries
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── public/                    # Static assets
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── netlify.toml
└── README.md
```

## 📊 Database Schema (Supabase)

### Tabel Utama

#### `anime`
- `id` (uuid, PK)
- `title` (varchar)
- `slug` (varchar, unique)
- `thumbnail_url` (text, nullable)
- `description` (text, nullable)
- `release_year` (integer, nullable)
- `status` (enum: 'ongoing', 'completed')
- `day_of_week` (integer 0-6, nullable)
- `total_episodes` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `episodes`
- `id` (uuid, PK)
- `anime_id` (uuid, FK → anime.id)
- `title` (varchar)
- `episode_number` (integer)
- `episode_title` (varchar, nullable)
- `season_number` (integer)
- `thumbnail_url` (text, nullable)
- `duration_seconds` (integer)
- `views` (integer)
- `release_year` (integer, nullable)
- `created_at` (timestamp)
- Embed URLs: `embed_url_turbovip_480`, `embed_url_turbovip_720`, `embed_url_filedon_480`, `embed_url_filedon_720`
- Download URLs: `download_url_turbovip_480`, `download_url_turbovip_720`, `download_url_filedon_480`, `download_url_filedon_720`

#### `genres`
- `id` (uuid, PK)
- `name` (varchar)
- `slug` (varchar, unique)

#### `anime_genres` (Junction Table)
- `anime_id` (uuid, FK → anime.id)
- `genre_id` (uuid, FK → genres.id)

### Video Embed & Download Servers

Setiap episode mendukung multiple server:
- **TurboVIP**: 480p, 720p
- **FileDon**: 480p, 720p

## 🚀 Cara Menjalankan Project

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account & project

### Installation

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd ANIMEWEB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Buat file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup database**
   - Jalankan SQL migration: `migrations-anime-episodes.sql`
   - Setup RLS: `supabase-rls-setup.sql`
   - Setup video servers: `SETUP_VIDEO_SERVERS_RLS.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000)

6. **Build untuk production**
   ```bash
   npm run build
   npm start
   ```

## 🎨 Design System

- **Color Scheme**: Dark theme (#0b0c0f background)
- **Primary Color**: Blue (#3b82f6)
- **Font**: System fonts + Google Sans via next/font
- **Responsive**: Mobile-first approach
- **Grid**: 3-6 columns berdasarkan breakpoint

## 🔐 Keamanan

**Current**:
- Environment variables untuk Supabase credentials
- Row Level Security (RLS) di Supabase

**Recommended untuk Production**:
1. Authentication middleware untuk admin routes
2. Input validation & sanitization
3. Rate limiting pada API routes
4. HTTPS enforcement
5. Content Security Policy (CSP)

## 📦 Deployment

### Netlify
1. Connect repository ke Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables di Netlify dashboard
5. Deploy!

Konfigurasi Netlify ada di `netlify.toml`.

## 📝 Dokumentasi Terkait

- `README.md` - Default Next.js README
- `ADMIN_GUIDE.md` - Panduan lengkap admin dashboard
- `ADD_VIDEO_SERVERS.md` - Panduan menambah video server
- `SETUP_EPISODES.md` - Panduan setup episodes
- `DB_MIGRATION_v2.md` - Database migration guide
- `CLAUDE.md` & `AGENTS.md` - AI agent instructions

## 🔄 Development Workflow

1. Buat branch baru untuk fitur
2. Develop & test locally
3. Commit dengan message yang jelas
4. Push & create PR
5. Review & merge ke main
6. Netlify auto-deploy

## 📈 Next Steps / Roadmap

- [ ] User authentication & profiles
- [ ] Comments & ratings
- [ ] Bookmark/anime list (MyAnime)
- [ ] Advanced search & filters
- [ ] Episode download manager
- [ ] Analytics dashboard
- [ ] PWA support
- [ ] Multi-language support
- [ ] Ad management system
- [ ] SEO optimization (meta tags, Open Graph)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Untuk pertanyaan atau bantuan:
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Dibuat dengan ❤️ menggunakan Next.js 16 + Supabase**
