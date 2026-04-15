// src/lib/admin-queries.ts
import { supabase } from './supabase';

// ===== VIDEO OPERATIONS =====
export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      video_categories (categories (id, name, slug)),
      video_tags (tags (id, name)),
      video_servers (id, server_name, embed_url)
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
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
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
    .from('categories')
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
      console.error('🔐 RLS Permission Error: Check Supabase RLS policies on "categories" table');
      console.error('Go to Supabase Dashboard → Auth Policies → categories table');
    }

    return null;
  }

  console.log('✅ Category created:', data);
  return data;
}

// Link video to categories
export async function addVideoCategory(videoId: string, categoryId: string) {
  const { data, error } = await supabase
    .from('video_categories')
    .insert([{ video_id: videoId, category_id: categoryId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding video category:', error);
    return null;
  }
  return data;
}

export async function removeVideoCategory(videoId: string, categoryId: string) {
  const { error } = await supabase
    .from('video_categories')
    .delete()
    .eq('video_id', videoId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error removing video category:', error);
    return false;
  }
  return true;
}

// ===== TAG OPERATIONS =====
export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  return data || [];
}

export async function createTag(name: string) {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    return null;
  }
  return data;
}

// Link video to tags
export async function addVideoTag(videoId: string, tagId: string) {
  const { data, error } = await supabase
    .from('video_tags')
    .insert([{ video_id: videoId, tag_id: tagId }])
    .select()
    .single();

  if (error) {
    console.error('Error adding video tag:', error);
    return null;
  }
  return data;
}

export async function removeVideoTag(videoId: string, tagId: string) {
  const { error } = await supabase
    .from('video_tags')
    .delete()
    .eq('video_id', videoId)
    .eq('tag_id', tagId);

  if (error) {
    console.error('Error removing video tag:', error);
    return false;
  }
  return true;
}

// ===== VIDEO SERVER OPERATIONS =====
export async function addVideoServer(videoId: string, data: {
  server_name: string;
  embed_url: string;
}) {
  const { data: result, error } = await supabase
    .from('video_servers')
    .insert([{ video_id: videoId, ...data }])
    .select()
    .single();

  if (error) {
    console.error('Error adding video server:', error);
    return null;
  }
  return result;
}

export async function removeVideoServer(serverId: string) {
  const { error } = await supabase
    .from('video_servers')
    .delete()
    .eq('id', serverId);

  if (error) {
    console.error('Error removing video server:', error);
    return false;
  }
  return true;
}

export async function getVideoServers(videoId: string) {
  const { data, error } = await supabase
    .from('video_servers')
    .select('*')
    .eq('video_id', videoId);

  if (error) {
    console.error('Error fetching video servers:', error);
    return [];
  }
  return data || [];
}
