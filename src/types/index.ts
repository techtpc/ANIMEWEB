// src/types/index.ts

export interface Anime {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  description?: string;
  release_year?: number;
  status: 'ongoing' | 'completed';
  // 0..6 for day-of-week (only meaningful for status='ongoing')
  day_of_week?: number | null;
  total_episodes: number;
  created_at: string;
  anime_genres?: { genres: { id: string; name: string; slug: string } }[];
}

export interface Episode {
  id: string;
  anime_id: string;
  title: string;
  episode_number: number;
  episode_title?: string;
  season_number: number;
  thumbnail_url: string | null;
  duration_seconds: number;
  views: number;
  release_year?: number;
  created_at: string;

  // Embed URLs per server + quality
  embed_url_turbovip_480?: string | null;
  embed_url_turbovip_720?: string | null;
  embed_url_filedon_480?: string | null;
  embed_url_filedon_720?: string | null;

  // Download URLs per server + quality
  download_url_turbovip_480?: string | null;
  download_url_turbovip_720?: string | null;
  download_url_filedon_480?: string | null;
  download_url_filedon_720?: string | null;
}

export interface Video {
  id: string;
  created_at: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  release_year: number;
  anime_id: string;
  episode_number: number;
  episode_title?: string | null;

  // Embed URLs per server + quality
  embed_url_turbovip_480?: string | null;
  embed_url_turbovip_720?: string | null;
  embed_url_filedon_480?: string | null;
  embed_url_filedon_720?: string | null;

  // Download URLs per server + quality
  download_url_turbovip_480?: string | null;
  download_url_turbovip_720?: string | null;
  download_url_filedon_480?: string | null;
  download_url_filedon_720?: string | null;
}