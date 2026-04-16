// src/types/index.ts

export interface Anime {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  description?: string;
  release_year?: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  total_episodes: number;
  created_at: string;
  video_categories?: { categories: { id: string; name: string; slug: string } }[];
}

export interface Episode {
  id: string;
  anime_id: string;
  title: string;
  episode_number: number;
  episode_title?: string;
  season_number: number;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  release_year?: number;
  download_url?: string;
  created_at: string;
  video_categories?: { categories: { name: string } }[];
  video_tags?: { tags: { name: string } }[];
  video_servers?: VideoServer[];
}

export interface Video {
  id: string;
  created_at: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  release_year: number;
  download_url?: string;
  // Relasi
  video_categories?: { categories: { name: string } }[];
  video_tags?: { tags: { name: string } }[];
}

export interface VideoServer {
  id: string;
  video_id: string;
  server_name: string;
  embed_url: string;
}