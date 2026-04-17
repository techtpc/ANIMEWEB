-- ========================================
-- SUPABASE RLS SETUP (ANIMEWEB v2)
-- Public read policies for new schema:
-- - public.anime
-- - public.videos (episodes)
-- - public.genres
-- - public.anime_genres
-- ========================================

-- Anime
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on anime" ON public.anime
FOR SELECT USING (true);

-- Episodes
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on videos" ON public.videos
FOR SELECT USING (true);

-- Genres
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on genres" ON public.genres
FOR SELECT USING (true);

-- Join table
ALTER TABLE public.anime_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on anime_genres" ON public.anime_genres
FOR SELECT USING (true);

-- NOTE:
-- If you still have legacy tables (studios/categories/tags/video_servers),
-- you may keep their policies separately. The app (after rework) should not use them.
