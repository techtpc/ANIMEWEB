# Admin Dashboard - Dokumentasi

## 📋 Overview

Admin dashboard lengkap untuk mengelola data anime/video streaming dengan dukungan penuh untuk semua relasi tabel database.

## 🗂️ Struktur File

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Layout admin dengan sidebar
│       ├── page.tsx            # Dashboard utama
│       ├── videos/
│       │   ├── page.tsx        # List semua video
│       │   ├── new/
│       │   │   └── page.tsx    # Form tambah video baru
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx # Form edit video
│       ├── categories/
│       │   └── page.tsx        # Kelola kategori/genre
│       └── tags/
│           └── page.tsx        # Kelola tags
├── components/
│   └── admin/
│       └── VideoForm.tsx       # Komponen form video reusable
└── lib/
    └── admin-queries.ts        # Fungsi database CRUD untuk admin
```

## 🚀 Fitur Utama

### 1. **Dashboard Admin** (`/admin`)

- Ringkasan statistik (total video, kategori, tags, studio)
- Quick actions untuk akses cepat
- Sidebar navigasi lengkap

### 2. **Manajemen Video** (`/admin/videos`)

#### List Video (`/admin/videos`)

- Tampilan tabel semua video
- Informasi: Judul, Studio, Kategori, Tags, Tahun
- Action: Edit dan Hapus
- Thumbnail preview

#### Tambah Video (`/admin/videos/new`)

- Form lengkap dengan semua field

#### Edit Video (`/admin/videos/[id]/edit`)

- Edit semua informasi video
- Update relasi kategori & tags
- Manage server video

### 3. **Form Video** (Komponen: `VideoForm.tsx`)

Mencakup semua field berikut:

#### Informasi Dasar

- **Judul** (required)
- **Tahun Rilis** (required)
- **Durasi (detik)** (required)
- **URL Thumbnail** (required)
- **URL Download** (optional)
- **Studio** (dropdown dengan opsi tambah baru)

#### Kategori/Genre

- Multi-select dari kategori yang tersedia
- Opsi untuk membuat kategori baru
- Scrollable list

#### Tags

- Multi-select dari tags yang tersedia
- Opsi untuk membuat tag baru
- Scrollable list

#### Server Video (Hanya saat Edit)

- List server yang sudah ditambahkan
- Form untuk tambah server baru
- Opsi hapus per server
- Fields: Nama Server, URL Embed

### 4. **Manajemen Kategori** (`/admin/categories`)

- List semua kategori dalam grid
- Form tambah kategori baru
- Auto-generate slug dari nama

### 5. **Manajemen Tags** (`/admin/tags`)

- List semua tags
- Form tambah tag baru
- Visual tag badges

## 📊 Database Relations

### Tabel Utama

```
videos
├── id (PK)
├── title
├── thumbnail_url
├── duration_seconds
├── release_year
├── studio_id (FK)
├── download_url
└── created_at

studios
├── id (PK)
└── name

categories
├── id (PK)
├── name
└── slug

tags
├── id (PK)
└── name

video_servers
├── id (PK)
├── video_id (FK)
├── server_name
└── embed_url

video_categories (Junction Table)
├── video_id (FK)
└── category_id (FK)

video_tags (Junction Table)
├── video_id (FK)
└── tag_id (FK)
```

## 🔧 Fungsi Database (`lib/admin-queries.ts`)

### Video Operations

- ✅ `getVideos()` - Ambil semua video dengan relasi
- ✅ `createVideo(data)` - Buat video baru
- ✅ `updateVideo(id, data)` - Update video
- ✅ `deleteVideo(id)` - Hapus video

### Category Operations

- ✅ `getCategories()` - Ambil semua kategori
- ✅ `createCategory(name, slug)` - Buat kategori baru
- ✅ `addVideoCategory(videoId, categoryId)` - Link video ke kategori
- ✅ `removeVideoCategory(videoId, categoryId)` - Unlink video dari kategori

### Tag Operations

- ✅ `getTags()` - Ambil semua tags
- ✅ `createTag(name)` - Buat tag baru
- ✅ `addVideoTag(videoId, tagId)` - Link video ke tag
- ✅ `removeVideoTag(videoId, tagId)` - Unlink video dari tag

### Studio Operations

- ✅ `getStudios()` - Ambil semua studio
- ✅ `createStudio(name)` - Buat studio baru

### Server Operations

- ✅ `addVideoServer(videoId, data)` - Tambah server video
- ✅ `removeVideoServer(serverId)` - Hapus server video
- ✅ `getVideoServers(videoId)` - Ambil semua server untuk video

## 🎨 Styling

- Tailwind CSS dengan color scheme: Blue (Primary), Purple (Secondary), Green (Success)
- Responsive design (mobile, tablet, desktop)
- Interactive hover effects
- Form validation feedback

## 💡 Cara Menggunakan

### 1. Menambah Video Baru

1. Klik "Tambah Video" di sidebar atau dashboard
2. Isi form dengan informasi lengkap
3. Pilih atau buat studio baru
4. Pilih kategori (bisa multiple)
5. Pilih tags (bisa multiple)
6. Klik "Simpan Video"

### 2. Edit Video & Tambah Server

1. Pergi ke "Kelola Video"
2. Klik "Edit" pada video yang diinginkan
3. Ubah informasi yang diperlukan
4. Di bagian "Server Video", tambahkan server baru:
   - Nama server (contoh: "ServerID 1", "Backup")
   - URL embed video
5. Klik "Perbarui Video"

### 3. Mengelola Kategori & Tags

- Pergi ke "Kelola Kategori" atau "Kelola Tags"
- Masukkan nama baru
- Klik "Tambah"
- Kategori/tag baru akan langsung tersedia di form video

## ⚙️ Konfigurasi

Pastikan environment variables sudah benar di `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 🔐 Keamanan (Recommended)

Untuk production, tambahkan:

1. **Authentication** - Middleware untuk check admin access
2. **Authorization** - Row-level security di Supabase
3. **Logging** - Track semua perubahan data
4. **Validation** - Server-side input validation

Contoh middleware auth (buat di `middleware.ts`):

```typescript
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Proteksi route /admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return res;
}
```

## 📝 Troubleshooting

### Video tidak muncul di list

- Pastikan Supabase connection valid
- Check browser console untuk error messages
- Verify database tables ada & accessible

### Form tidak bisa submit

- Validasi field required sudah diisi
- Check network request di DevTools
- Lihat error message yang muncul

### Relasi tidak tersimpan

- Pastikan foreign keys valid
- Check junction tables (video_categories, video_tags) di database
- Verify data constraint di Supabase

## 🚀 Next Steps (Opsional)

1. Tambah **Episode Management** untuk series
2. Implementasi **Upload Image Service** untuk thumbnail
3. Tambah **Batch Operations** (upload banyak video)
4. Implementasi **Search & Filter** yang lebih canggih
5. Tambah **Analytics Dashboard** (views, popular videos)
6. Implementasi **Export/Import** data (CSV, JSON)

## 📞 Support

Untuk masalah atau pertanyaan lebih lanjut, gunakan dokumentasi:

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
