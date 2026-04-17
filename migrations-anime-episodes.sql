-- ========================================
-- ANIMEWEB DB MIGRATION v2
-- Rework: status(ongoing/completed) + day_of_week + genres
-- Episode/watch: embed/download per server (TurboVIP/FileDon) and quality (480/720)
-- ========================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old genre/tag system + video_servers (replaced by per-episode fields)
DROP TABLE IF EXISTS public.anime_genres CASCADE;
DROP TABLE IF EXISTS public.genres CASCADE;

DROP TABLE IF EXISTS public.video_servers CASCADE;
DROP TABLE IF EXISTS public.video_categories CASCADE;
DROP TABLE IF EXISTS public.video_tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- Reset core tables (replace schema)
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.anime CASCADE;

-- Core: anime
CREATE TABLE public.anime (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  thumbnail_url VARCHAR,
  description TEXT,
  release_year INTEGER,
  status VARCHAR NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed')),
  -- 0..6 for day-of-week (mapping bisa Anda tentukan di kode/frontend)
  -- only meaningful for status='ongoing'
  day_of_week INTEGER NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  total_episodes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Core: genres
CREATE TABLE public.genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Many-to-many: anime <-> genres
CREATE TABLE public.anime_genres (
  anime_id UUID NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (anime_id, genre_id)
);

-- Episodes: previously `videos` + normalized server table
-- Now embed/download are stored directly per server & quality.
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anime_id UUID NOT NULL REFERENCES public.anime(id) ON DELETE CASCADE,

  episode_number INTEGER NOT NULL,
  episode_title VARCHAR,
  season_number INTEGER DEFAULT 1,

  title VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  duration_seconds INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  release_year INTEGER,

  -- Embed URLs
  embed_url_turbovip_480 TEXT,
  embed_url_turbovip_720 TEXT,
  embed_url_filedon_480 TEXT,
  embed_url_filedon_720 TEXT,

  -- Download URLs (below the player)
  download_url_turbovip_480 TEXT,
  download_url_turbovip_720 TEXT,
  download_url_filedon_480 TEXT,
  download_url_filedon_720 TEXT,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT videos_anime_episode_unique UNIQUE (anime_id, episode_number)
);

CREATE INDEX idx_videos_anime_id ON public.videos(anime_id);
CREATE INDEX idx_videos_anime_episode_number ON public.videos(anime_id, episode_number);
CREATE INDEX idx_videos_episode_number ON public.videos(episode_number);

-- Optional sample data for easier testing
-- (Safe: if you already have real data, just delete these INSERTs)
INSERT INTO public.genres (name, slug)
VALUES ('Action', 'action')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.anime (
  title,
  slug,
  thumbnail_url,
  description,
  release_year,
  status,
  day_of_week,
  total_episodes
)
VALUES (
  'One Piece',
  'one-piece',
  NULL,
  'Mengikuti petualangan Monkey D. Luffy dalam mencari One Piece Treasure',
  1999,
  'ongoing',
  1, -- example: 0..6
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Link One Piece -> Action genre (if both exist)
INSERT INTO public.anime_genres (anime_id, genre_id)
SELECT a.id, g.id
FROM public.anime a
CROSS JOIN public.genres g
WHERE a.slug = 'one-piece' AND g.slug = 'action'
ON CONFLICT (anime_id, genre_id) DO NOTHING;

-- Insert episode 1 with empty embed/download placeholders (edit later)
INSERT INTO public.videos (
  anime_id,
  episode_number,
  episode_title,
  season_number,
  title,
  thumbnail_url,
  duration_seconds,
  views,
  release_year,
  embed_url_turbovip_480,
  embed_url_turbovip_720,
  embed_url_filedon_480,
  embed_url_filedon_720,
  download_url_turbovip_480,
  download_url_turbovip_720,
  download_url_filedon_480,
  download_url_filedon_720
)
SELECT
  a.id,
  1,
  'The Man Who Will Become the Pirate King',
  1,
  'One Piece Episode 1',
  NULL,
  0,
  0,
  a.release_year,
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL
FROM public.anime a
WHERE a.slug = 'one-piece'
ON CONFLICT DO NOTHING;

COMMIT;
