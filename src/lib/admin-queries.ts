// src/lib/admin-queries.ts
import { supabase } from './supabase';

// ===== VIDEO OPERATIONS =====
export async function getVideos(page: number = 1, pageSize: number = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
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
      download_url_filedon_720,
      anime:anime_id (
        id,
        title,
        slug,
        thumbnail_url,
        release_year,
        status,
        total_episodes
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching videos:', error);
    return { data: [], count: 0, totalPages: 0 };
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return {
    data: data || [],
    count: count || 0,
    totalPages,
  };
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

  console.log('📝 Creating genre:', { name: trimmedName, slug: trimmedSlug });

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
      console.warn('⚠️ Duplicate: Genre "' + trimmedSlug + '" already exists');
      // Try to fetch and return existing genre
      const { data: existing } = await supabase
        .from('genres')
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

  console.log('✅ Genre created:', data);
  return data;
}

// Link anime to genres (replaces old addVideoCategory)
export async function addAnimeGenre(animeId: string, genreId: string) {
  const { data, error } = await supabase
    .from('anime_genres')
    .insert([{ anime_id: animeId, genre_id: genreId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding anime genre:', error);
    return null;
  }

  return data;
}

// Remove anime genre relation (replaces old removeVideoCategory)
export async function removeAnimeGenre(animeId: string, genreId: string) {
  const { error } = await supabase
    .from('anime_genres')
    .delete()
    .eq('anime_id', animeId)
    .eq('genre_id', genreId);

  if (error) {
    console.error('Error removing anime genre:', error);
    return false;
  }

  return true;
}

// ===== TAG OPERATIONS =====
// Note: DB v2 removes tags - tags functionality deprecated
// Keep empty functions for backward compatibility with admin UI
export async function getTags() {
  console.warn('Tags are deprecated in DB v2');
  return [];
}

export async function createTag(name: string) {
  console.warn('Tags are deprecated in DB v2');
  return null;
}

export async function addVideoTag(videoId: string, tagId: string) {
  console.warn('Tags are deprecated in DB v2');
  return null;
}

export async function removeVideoTag(videoId: string, tagId: string) {
  console.warn('Tags are deprecated in DB v2');
  return true;
}

// ===== VIDEO SERVER OPERATIONS =====
// Note: DB v2 stores embed URLs directly in videos table
// Server management is done via direct column updates (embed_url_turbovip_480, etc.)

export async function addVideoEmbed(videoId: string, server: 'turbovip' | 'filedon', quality: 480 | 720, embedUrl: string) {
  const column = `embed_url_${server}_${quality}` as keyof any;
  
  const { data, error } = await supabase
    .from('videos')
    .update({ [column]: embedUrl })
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('Error adding video embed:', error);
    return null;
  }

  return data;
}

export async function addVideoDownload(videoId: string, server: 'turbovip' | 'filedon', quality: 480 | 720, downloadUrl: string) {
  const column = `download_url_${server}_${quality}` as keyof any;
  
  const { data, error } = await supabase
    .from('videos')
    .update({ [column]: downloadUrl })
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('Error adding video download:', error);
    return null;
  }

  return data;
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

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  try {
    // Count total videos
    const { count: videoCount, error: videoError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true });

    // Count total genres
    const { count: genreCount, error: genreError } = await supabase
      .from('genres')
      .select('*', { count: 'exact', head: true });

    // Count total anime
    const { count: animeCount, error: animeError } = await supabase
      .from('anime')
      .select('*', { count: 'exact', head: true });

    if (videoError) console.error('Error counting videos:', videoError);
    if (genreError) console.error('Error counting genres:', genreError);
    if (animeError) console.error('Error counting anime:', animeError);

    return {
      videos: videoCount || 0,
      genres: genreCount || 0,
      anime: animeCount || 0,
      tags: 0, // Placeholder
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { videos: 0, genres: 0, anime: 0, tags: 0 };
  }
}
