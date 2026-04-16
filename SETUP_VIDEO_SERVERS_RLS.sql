-- ========================================
-- SETUP VIDEO SERVERS - RLS & INSERT DATA
-- ========================================

-- Step 1: Enable RLS on video_servers table
ALTER TABLE public.video_servers ENABLE ROW LEVEL SECURITY;

-- Step 2: Add read policy for public
CREATE POLICY "Allow public read on video_servers" ON public.video_servers 
FOR SELECT USING (true);

-- Step 3: Allow insert (adjust auth based on your setup)
CREATE POLICY "Allow insert on video_servers" ON public.video_servers 
FOR INSERT WITH CHECK (true);

-- Step 4: Insert video servers for One Piece
-- GANTI NILAI INI DENGAN MILIK ANDA:
-- video_id: Dari halaman /debug bagian "Videos" - lihat ID One Piece
-- server_name: Nama server (FileDon, TurboVPlay, dsb)
-- embed_url: URL embed lengkap dari provider

INSERT INTO public.video_servers (video_id, server_name, embed_url)
VALUES 
  (
    '686ac3e0-a229-4940-975a-412099cc43ad',  -- GANTI dengan Video ID Anda
    'FileDon',
    'https://filedo.org/embed/xxxxx'         -- GANTI dengan URL FileDon Anda
  ),
  (
    '686ac3e0-a229-4940-975a-412099cc43ad',  -- GANTI dengan Video ID Anda
    'TurboVPlay',
    'https://turbovplay.com/embed/xxxxx'     -- GANTI dengan URL TurboVPlay Anda
  );

-- Verify data sudah tersimpan
SELECT 
  vs.id,
  vs.server_name,
  vs.embed_url,
  vs.video_id,
  v.title as video_title
FROM public.video_servers vs
LEFT JOIN public.videos v ON vs.video_id = v.id
ORDER BY vs.created_at DESC;
