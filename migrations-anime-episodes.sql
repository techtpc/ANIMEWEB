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
-- Add anime_id and episode_number if not exists
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
