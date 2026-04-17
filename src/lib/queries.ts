// src/lib/queries.ts
import { supabase } from './supabase';
import { Anime, Episode } from '@/types';

// ===== ANIME QUERIES =====
export async function getAnimeBySlug(slug: string): Promise<Anime | null> {
  const { data, error } = await supabase
    .from('anime')
    .select(`
      *,
      anime_genres (
        genres (id, name, slug)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching anime by slug:', error);
    return null;
  }
  return data;
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const { data, error } = await supabase
    .from('anime')
    .select(`
      *,
      anime_genres (
        genres (id, name, slug)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching anime by id:', error);
    return null;
  }
  return data;
}

export async function getAllAnime(): Promise<Anime[]> {
  const { data, error } = await supabase
    .from('anime')
    .select(`
      *,
      anime_genres (
        genres (id, name, slug)
      )
    `)
    .order('title');

  if (error) {
    console.error('Error fetching anime:', error);
    return [];
  }
  return data || [];
}

// ===== EPISODE QUERIES =====
export async function getEpisodesByAnimeId(animeId: string): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('anime_id', animeId)
    .order('episode_number', { ascending: true });

  if (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
  return data || [];
}

export async function getEpisodeById(episodeId: string): Promise<Episode | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', episodeId)
    .single();

  if (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
  return data;
}

export async function getVideoDetail(id: string) {
  return getEpisodeById(id);
}