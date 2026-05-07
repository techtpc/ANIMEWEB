import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a server-side Supabase client using service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const videoId: string | undefined = body.videoId || body.episodeId;
    const animeData = body.animeData || null;
    const videoData = body.videoData || body.episodeData || null;
    const genreIds: string[] = body.genreIds || body.categories || body.selectedGenres || [];

    if (action === 'create') {
      return await createAnimeVideo({ animeData, videoData, genreIds });
    }

    if (action === 'update') {
      if (!videoId) {
        return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
      }
      return await updateAnimeVideo({ videoId, animeData, videoData, genreIds });
    }

    if (action === 'delete') {
      if (!videoId) {
        return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
      }
      return await deleteVideo(videoId);
    }

    if (action === 'updateEmbeds') {
      if (!videoId) {
        return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
      }
      return await updateEmbeds(videoId, body.embeds, body.downloads);
    }

    if (action === 'addGenre') {
      if (!videoId || !body.genreId) {
        return NextResponse.json({ error: 'videoId and genreId are required' }, { status: 400 });
      }
      return await addAnimeGenre(videoId, body.genreId);
    }

    if (action === 'removeGenre') {
      if (!videoId || !body.genreId) {
        return NextResponse.json({ error: 'videoId and genreId are required' }, { status: 400 });
      }
      return await removeAnimeGenre(videoId, body.genreId);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('❌ [API] Exception:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

async function createAnimeVideo({
  animeData,
  videoData,
  genreIds,
}: {
  animeData: any;
  videoData: any;
  genreIds: string[];
}) {
  if (!animeData || !animeData.slug) {
    return NextResponse.json({ error: 'animeData.slug is required' }, { status: 400 });
  }
  if (!videoData || typeof videoData.episode_number !== 'number') {
    return NextResponse.json({ error: 'videoData.episode_number is required' }, { status: 400 });
  }

  // 1) Create anime
  const { data: createdAnime, error: animeError } = await supabaseAdmin
    .from('anime')
    .insert([animeData])
    .select()
    .single();

  let animeId = createdAnime?.id;

  if (animeError && (animeError.code === '23505' || (animeError.message || '').toLowerCase().includes('duplicate'))) {
    // If slug already exists, use existing anime row
    const { data: existingAnime } = await supabaseAdmin
      .from('anime')
      .select('*')
      .eq('slug', animeData.slug)
      .single();

    animeId = existingAnime?.id;
  }

  if (!animeId) {
    return NextResponse.json({ error: animeError?.message || 'Failed to create anime' }, { status: 500 });
  }

  // 2) Link genres (best-effort)
  if (genreIds && genreIds.length > 0) {
    await supabaseAdmin.from('anime_genres').delete().eq('anime_id', animeId);
    await supabaseAdmin.from('anime_genres').insert(genreIds.map((gid) => ({ anime_id: animeId, genre_id: gid })));
  }

  // 3) Create video/episode
  const { data: createdVideo, error: videoError } = await supabaseAdmin
    .from('videos')
    .insert([{ ...videoData, anime_id: animeId }])
    .select()
    .single();

  if (videoError) {
    console.error('❌ [API] Video create error:', videoError);
    return NextResponse.json({ error: videoError.message, code: videoError.code }, { status: 500 });
  }

  // Update anime updated_at so it sorts to the top
  await supabaseAdmin.from('anime').update({ updated_at: new Date().toISOString() }).eq('id', animeId);

  return NextResponse.json({ data: createdVideo }, { status: 201 });
}

async function updateAnimeVideo({
  videoId,
  animeData,
  videoData,
  genreIds,
}: {
  videoId: string;
  animeData: any;
  videoData: any;
  genreIds: string[];
}) {
  const { data: existingVideo } = await supabaseAdmin
    .from('videos')
    .select('anime_id')
    .eq('id', videoId)
    .single();

  const animeId = existingVideo?.anime_id;
  if (!animeId) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  // Update anime metadata and bump updated_at
  if (animeData) {
    await supabaseAdmin.from('anime').update({ ...animeData, updated_at: new Date().toISOString() }).eq('id', animeId);
  } else {
    await supabaseAdmin.from('anime').update({ updated_at: new Date().toISOString() }).eq('id', animeId);
  }

  // Replace genres
  await supabaseAdmin.from('anime_genres').delete().eq('anime_id', animeId);
  if (genreIds && genreIds.length > 0) {
    await supabaseAdmin
      .from('anime_genres')
      .insert(genreIds.map((gid) => ({ anime_id: animeId, genre_id: gid })));
  }

  // Update video
  const { data: updatedVideo, error: videoError } = await supabaseAdmin
    .from('videos')
    .update(videoData)
    .eq('id', videoId)
    .select()
    .single();

  if (videoError) {
    console.error('❌ [API] Video update error:', videoError);
    return NextResponse.json({ error: videoError.message, code: videoError.code }, { status: 500 });
  }

  return NextResponse.json({ data: updatedVideo }, { status: 200 });
}

async function deleteVideo(videoId: string) {
  const { error } = await supabaseAdmin.from('videos').delete().eq('id', videoId);
  if (error) {
    console.error('❌ [API] Video delete error:', error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

async function updateEmbeds(videoId: string, embeds: any, downloads: any) {
  const updateData: any = {};

  // Add embed URLs
  if (embeds) {
    if (embeds.turbovip_480) updateData.embed_url_turbovip_480 = embeds.turbovip_480;
    if (embeds.turbovip_720) updateData.embed_url_turbovip_720 = embeds.turbovip_720;
    if (embeds.filedon_480) updateData.embed_url_filedon_480 = embeds.filedon_480;
    if (embeds.filedon_720) updateData.embed_url_filedon_720 = embeds.filedon_720;
  }

  // Add download URLs
  if (downloads) {
    if (downloads.turbovip_480) updateData.download_url_turbovip_480 = downloads.turbovip_480;
    if (downloads.turbovip_720) updateData.download_url_turbovip_720 = downloads.turbovip_720;
    if (downloads.filedon_480) updateData.download_url_filedon_480 = downloads.filedon_480;
    if (downloads.filedon_720) updateData.download_url_filedon_720 = downloads.filedon_720;
  }

  const { data, error } = await supabaseAdmin
    .from('videos')
    .update(updateData)
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Update embeds error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

async function addAnimeGenre(videoId: string, genreId: string) {
  // Get anime_id from video
  const { data: video } = await supabaseAdmin
    .from('videos')
    .select('anime_id')
    .eq('id', videoId)
    .single();

  if (!video?.anime_id) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('anime_genres')
    .insert([{ anime_id: video.anime_id, genre_id: genreId }])
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Add genre error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

async function removeAnimeGenre(videoId: string, genreId: string) {
  // Get anime_id from video
  const { data: video } = await supabaseAdmin
    .from('videos')
    .select('anime_id')
    .eq('id', videoId)
    .single();

  if (!video?.anime_id) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from('anime_genres')
    .delete()
    .eq('anime_id', video.anime_id)
    .eq('genre_id', genreId);

  if (error) {
    console.error('❌ [API] Remove genre error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
