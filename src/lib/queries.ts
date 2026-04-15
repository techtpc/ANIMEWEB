// src/lib/queries.ts
import { supabase } from './supabase';

export async function getVideoDetail(id: string) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      studios (name),
      video_categories (categories (name, slug)),
      video_tags (tags (name)),
      video_servers (server_name, embed_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching video:', error);
    return null;
  }
  return data;
}