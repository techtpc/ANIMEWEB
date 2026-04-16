-- Run these SQL queries in Supabase SQL Editor (bottom left of dashboard)
-- untuk menambahkan READ policy untuk public/anonymous users

-- 1. Videos - Allow public read
CREATE POLICY "Allow public read on videos"
ON public.videos
FOR SELECT
USING (true);

-- 2. Studios - Allow public read  
CREATE POLICY "Allow public read on studios"
ON public.studios
FOR SELECT
USING (true);

-- 3. Categories - Allow public read
CREATE POLICY "Allow public read on categories"
ON public.categories
FOR SELECT
USING (true);

-- 4. Tags - Allow public read
CREATE POLICY "Allow public read on tags"
ON public.tags
FOR SELECT
USING (true);

-- 5. Video Categories - Allow public read
CREATE POLICY "Allow public read on video_categories"
ON public.video_categories
FOR SELECT
USING (true);

-- 6. Video Tags - Allow public read
CREATE POLICY "Allow public read on video_tags"
ON public.video_tags
FOR SELECT
USING (true);

-- 7. Video Servers - Allow public read
CREATE POLICY "Allow public read on video_servers"
ON public.video_servers
FOR SELECT
USING (true);
