// src/types/index.ts

export interface Video {
  id: string;
  created_at: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  release_year: number;
  studio_id?: string;
  download_url?: string;
  // Relasi (jika menggunakan join query)
  studios?: { name: string };
  video_categories?: { categories: { name: string } }[];
  video_tags?: { tags: { name: string } }[];
}

export interface VideoServer {
  id: string;
  video_id: string;
  server_name: string;
  embed_url: string;
}