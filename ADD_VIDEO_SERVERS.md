# Cara Menambahkan Video Servers (Streaming Links)

## 📌 Latar Belakang

Saat ini Anda sudah punya:

- ✅ Tabel `anime` - Info anime
- ✅ Tabel `videos` - Episodes
- ✅ Tabel `video_servers` - Links streaming (FileDon, TurboVPlay, dsb)

## 🔗 Struktur video_servers Table

```
id (UUID)           - Auto-generate
video_id (FK)       - Link ke video/episode
server_name         - Nama server (contoh: "FileDon", "TurboVPlay", "BStation")
embed_url           - URL embed lengkap dari layanan streaming
created_at          - Timestamp
```

## ✅ Cara Menambahkan Server

### **Opsi 1: Lewat Supabase UI (Paling Mudah)**

1. Buka **Supabase Dashboard** → Project Anda
2. Klik table **`video_servers`**
3. Klik **"Insert row"** atau **"+"**
4. Isi data:

| Field         | Value                              |
| ------------- | ---------------------------------- |
| `video_id`    | Paste ID dari video One Piece Anda |
| `server_name` | `FileDon`                          |
| `embed_url`   | `https://filedo.org/embed/xxxxx`   |

5. Klik **Save**
6. Ulangi untuk server lain (TurboVPlay, dsb)

**Contoh data yang benar:**

```
video_id:    686ac3e0-a229-4940-975a-412099cc43ad
server_name: FileDon
embed_url:   https://filedo.org/embed/xxxxx
```

---

### **Opsi 2: Lewat SQL Query**

Buka **SQL Editor** di Supabase dan run:

```sql
-- Tambah server FileDon
INSERT INTO public.video_servers (video_id, server_name, embed_url)
VALUES (
  '686ac3e0-a229-4940-975a-412099cc43ad',  -- Ganti dengan VIDEO_ID Anda
  'FileDon',
  'https://filedo.org/embed/xxxxx'         -- Ganti dengan URL FileDon Anda
);

-- Tambah server TurboVPlay
INSERT INTO public.video_servers (video_id, server_name, embed_url)
VALUES (
  '686ac3e0-a229-4940-975a-412099cc43ad',
  'TurboVPlay',
  'https://turbovplay.com/embed/xxxxx'     -- Ganti dengan URL TurboVPlay Anda
);
```

**Ganti:**

- `686ac3e0-a229-4940-975a-412099cc43ad` dengan ID video Anda
- `https://filedo.org/embed/xxxxx` dengan URL embed asli

---

## 🎯 Cara Dapat Embed Link

### **FileDon:**

1. Login ke FileDon
2. Cari file video
3. Copy **Embed Link** (bukan Download Link)
4. Format: `https://filedo.org/embed/[code]`

### **TurboVPlay:**

1. Login ke TurboVPlay
2. Ke Video Manager
3. Copy **Embed URL**
4. Format: `https://turbovplay.com/embed/[code]`

---

## 🧪 Test Setelah Menambah Server

1. Refresh halaman watch
2. Buka **Browser Console** (F12)
3. Lihat logs:
   - ✅ `✅ Episode data: {...}`
   - ✅ `📺 Video servers: [...]`
   - ✅ `✅ Setting default server: {...}`

Jika masih `⚠️ No servers found`, berarti data belum tersimpan dengan benar.

---

## 📝 Checklist Setup

- [ ] 1. Cari Video ID dari One Piece di halaman `/debug`
- [ ] 2. Login ke Supabase Dashboard
- [ ] 3. Buka table `video_servers`
- [ ] 4. Insert row dengan FileDon embed link
- [ ] 5. Insert row dengan TurboVPlay embed link
- [ ] 6. Refresh halaman watch
- [ ] 7. Server seharusnya sudah muncul

---

## ⚠️ Troubleshooting

**Server masih tidak muncul?**

1. Check `/debug` page → lihat Video ID yang benar
2. Buka database → table `video_servers` → pastikan data ada
3. Check apakah `video_id` sama persis dengan video ID di `videos` table

**Console menunjukkan error?**

1. Buka F12 → Console tab
2. Copy error message
3. Beri tahu saya

---

**Sudah menambahkan servers? Refresh halaman watch dan cek!** 🚀
