-- Disable RLS on all tables (internal use only)
-- Run this in Supabase SQL Editor

ALTER TABLE public.anime DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_genres DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (optional, they won't apply when RLS is disabled)
DROP POLICY IF EXISTS "Allow public read on anime" ON public.anime;
DROP POLICY IF EXISTS "Allow public read on videos" ON public.videos;
DROP POLICY IF EXISTS "Allow public read on genres" ON public.genres;
DROP POLICY IF EXISTS "Allow public read on anime_genres" ON public.anime_genres;
