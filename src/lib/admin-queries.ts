// src/lib/admin-queries.ts
import { supabase } from './supabase';

// ===== VIDEO OPERATIONS =====
export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      id,
      created_at,
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
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  return data || [];
}

export async function createVideo(videoData: {
  title: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  release_year?: number;
  download_url?: string;
}) {
  const { data, error } = await supabase
    .from('videos')
    .insert([videoData])
    .select()
    .single();

  if (error) {
    console.error('Error creating video:', error);
    return null;
  }
  return data;
}

export async function updateVideo(id: string, videoData: any) {
  const { data, error } = await supabase
    .from('videos')
    .update(videoData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating video:', error);
    return null;
  }
  return data;
}

export async function deleteVideo(id: string) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting video:', error);
    return false;
  }
  return true;
}

// ===== CATEGORY OPERATIONS =====
export async function getCategories() {
  // In DB v2, "categories" & "tags" are removed and replaced by "genres".
  // Keep this export for compatibility with existing UI until it's refactored.
  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching genres (categories compatibility):', error);
    return [];
  }
  return data || [];
}

export async function createCategory(name: string, slug: string) {
  // Validate inputs
  if (!name?.trim() || !slug?.trim()) {
    console.error('❌ Invalid inputs - name and slug required');
    return null;
  }

  const trimmedName = name.trim();
  const trimmedSlug = slug.toLowerCase().trim();

  console.log('📝 Creating category:', { name: trimmedName, slug: trimmedSlug });

  // Insert directly - let Supabase handle duplicates
  const { data, error } = await supabase
    .from('genres')
    .insert([
      {
        name: trimmedName,
        slug: trimmedSlug,
      },
    ])
    .select()
    .single();

  if (error) {
    // Log full error object for debugging
    console.error('❌ Supabase Error Full:', error);
    console.error('❌ Supabase Error Details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    // Check specific error types
    if (error.code === '23505') {
      console.warn('⚠️ Duplicate: Kategori "' + trimmedSlug + '" sudah ada');
      // Try to fetch and return existing category
      const { data: existing } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', trimmedSlug)
        .single();
      if (existing) return existing;
    }
    
    // Check for RLS policy error (typically code 42501)
    if (error.code === '42501') {
      console.error('🔐 RLS Permission Error: Check Supabase RLS policies on "genres" table');
      console.error('Go to Supabase Dashboard → Auth Policies → genres table');
    }

    return null;
  }

  console.log('✅ Category created:', data);
  return data;
}

// Link video to categories
export async function addVideoCategory(videoId: string, categoryId: string) {
  // DB v2 stores genre relations on anime, not on episode.
  // For now we implement a best-effort mapping:
  // 1) find video's anime_id
  // 2) insert (anime_id, genre_id) into anime_genres
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('anime_id')
    .eq('id', videoId)
    .single();

  if (videoError || !video?.anime_id) {
    console.error('Error mapping video->anime for genre:', videoError);
    return null;
  }

  const { data, error } = await supabase
    .from('anime_genres')
    .insert([{ anime_id: video.anime_id, genre_id: categoryId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding anime genre (categories compatibility):', error);
    return null;
  }

  return data;
}

export async function removeVideoCategory(videoId: string, categoryId: string) {
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('anime_id')
    .eq('id', videoId)
    .single();

  if (videoError || !video?.anime_id) {
    console.error('Error mapping video->anime for genre removal:', videoError);
    return false;
  }

  const { error } = await supabase
    .from('anime_genres')
    .delete()
    .eq('anime_id', video.anime_id)
    .eq('genre_id', categoryId);

  if (error) {
    console.error('Error removing anime genre (categories compatibility):', error);
    return false;
  }

  return true;
}

// ===== TAG OPERATIONS =====
export async function getTags() {
  // DB v2 removes tags; keep compatibility export for now.
  return [];
}

export async function createTag(name: string) {
  // DB v2 removes tags; keep compatibility export for now.
  return null;
}

// Link video to tags
export async function addVideoTag(videoId: string, tagId: string) {
  // DB v2 removes tags.
  return null;
}

export async function removeVideoTag(videoId: string, tagId: string) {
  // DB v2 removes tags.
  return true;
}

// ===== VIDEO SERVER OPERATIONS =====
export async function addVideoServer(videoId: string, data: {
  server_name: string;
  embed_url: string;
}) {
  // Compatibility shim:
  // - DB v2 stores embed URLs directly in videos table
  // - we can only write "480" embed here (quality selection will be refactored later)
  const serverName = (data.server_name || '').toLowerCase();
  const embedUrl = data.embed_url;

  if (!embedUrl) return null;

  const patch =
    serverName.includes('turbov') || serverName.includes('turboplay') || serverName.includes('turbovip')
      ? { embed_url_turbovip_480: embedUrl }
      : serverName.includes('file')
        ? { embed_url_filedon_480: embedUrl }
        : {};

  if (Object.keys(patch).length === 0) return null;

  const { data: result, error } = await supabase
    .from('videos')
    .update(patch)
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('Error adding embed (video server compatibility):', error);
    return null;
  }

  return result;
}

export async function removeVideoServer(serverId: string) {
  // DB v2 no longer uses video_servers.
  // This function is kept for compatibility until admin is refactored.
  return true;
}

export async function getVideoServers(videoId: string) {
  // DB v2 no longer uses video_servers.
  // We return a compatibility array (two servers) using quality=480 embeds.
  const { data: episode, error } = await supabase
    .from('videos')
    .select(`
      id,
      embed_url_turbovip_480,
      embed_url_filedon_480
    `)
    .eq('id', videoId)
    .single();

  if (error || !episode) {
    console.error('Error fetching episode embeds for servers (compat):', error);
    return [];
  }

  const out: any[] = [];

  if (episode.embed_url_turbovip_480) {
    out.push({
      id: 'turbovip-480',
      video_id: episode.id,
      server_name: 'TurboVPlay',
      embed_url: episode.embed_url_turbovip_480,
    });
  }

  if (episode.embed_url_filedon_480) {
    out.push({
      id: 'filedon-480',
      video_id: episode.id,
      server_name: 'FileDon',
      embed_url: episode.embed_url_filedon_480,
    });
  }

  return out;
}

// ===== GENRES / ANIME / EPISODE CRUD (new schema) =====

export async function getGenres() {
  const { data, error } = await supabase.from('genres').select('*').order('name');
  if (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
  return data || [];
}

export async function createGenre(name: string, slug: string) {
  const trimmedName = name?.trim();
  const trimmedSlug = slug?.toLowerCase().trim();
  if (!trimmedName || !trimmedSlug) return null;

  const { data, error } = await supabase
    .from('genres')
    .insert([{ name: trimmedName, slug: trimmedSlug }])
    .select()
    .single();

  if (error) {
    console.error('Error creating genre:', error);
    return null;
  }
  return data;
}

export async function getAnime() {
  const { data, error } = await supabase
    .from('anime')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching anime:', error);
    return [];
  }
  return data || [];
}

export async function getEpisodesByAnimeId(animeId: string) {
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

export async function updateGenre(id: string, data: { name?: string; slug?: string }) {
  const { data: result, error } = await supabase
    .from('genres')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating genre:', error);
    return null;
  }
  return result;
}

export async function deleteGenre(id: string) {
  const { error } = await supabase.from('genres').delete().eq('id', id);
  if (error) {
    console.error('Error deleting genre:', error);
    return false;
  }
  return true;
}

export async function createAnime(animeData: {
  title: string;
  slug: string;
  thumbnail_url?: string;
  description?: string;
  release_year?: number;
  status: 'ongoing' | 'completed';
  day_of_week?: number | null;
  total_episodes?: number;
}) {
  const { data, error } = await supabase
    .from('anime')
    .insert([animeData])
    .select()
    .single();

  if (error) {
    console.error('Error creating anime:', error);
    return null;
  }
  return data;
}

export async function updateAnime(id: string, animeData: any) {
  const { data, error } = await supabase
    .from('anime')
    .update(animeData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating anime:', error);
    return null;
  }
  return data;
}

export async function deleteAnime(id: string) {
  const { error } = await supabase.from('anime').delete().eq('id', id);
  if (error) {
    console.error('Error deleting anime:', error);
    return false;
  }
  return true;
}

export async function replaceAnimeGenres(animeId: string, genreIds: string[]) {
  // Replace relations atomically-ish (2 calls). For strictness, wrap in SQL transaction later.
  const { error: delError } = await supabase
    .from('anime_genres')
    .delete()
    .eq('anime_id', animeId);

  if (delError) {
    console.error('Error clearing anime_genres:', delError);
    return false;
  }

  if (!genreIds || genreIds.length === 0) return true;

  const rows = genreIds.map((genreId) => ({ anime_id: animeId, genre_id: genreId }));

  const { error: insError } = await supabase
    .from('anime_genres')
    .insert(rows);

  if (insError) {
    console.error('Error inserting anime_genres:', insError);
    return false;
  }

  return true;
}

export async function createEpisode(episodeData: any) {
  const { data, error } = await supabase
    .from('videos')
    .insert([episodeData])
    .select()
    .single();

  if (error) {
    console.error('Error creating episode:', error);
    return null;
  }
  return data;
}

export async function updateEpisode(id: string, episodeData: any) {
  const { data, error } = await supabase
    .from('videos')
    .update(episodeData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating episode:', error);
    return null;
  }
  return data;
}

export async function deleteEpisode(id: string) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) {
    console.error('Error deleting episode:', error);
    return false;
  }
  return true;
}
