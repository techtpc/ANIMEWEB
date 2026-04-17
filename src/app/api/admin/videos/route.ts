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

    // For backward compatibility with old client payloads
    const episodeId: string | undefined = body.episodeId || body.videoId;

    const animeData = body.animeData || null;
    const episodeData = body.episodeData || body.videoData || null;
    const genreIds: string[] = body.genreIds || body.categories || body.selectedGenres || [];

    if (action === 'create') {
      return await createAnimeEpisode({ animeData, episodeData, genreIds });
    }

    if (action === 'update') {
      if (!episodeId) {
        return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
      }
      return await updateAnimeEpisode({ episodeId, animeData, episodeData, genreIds });
    }

    if (action === 'delete') {
      if (!episodeId) {
        return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
      }
      return await deleteEpisode(episodeId);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('❌ [API] Exception:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

async function createAnimeEpisode({
  animeData,
  episodeData,
  genreIds,
}: {
  animeData: any;
  episodeData: any;
  genreIds: string[];
}) {
  if (!animeData || !animeData.slug) {
    return NextResponse.json({ error: 'animeData.slug is required' }, { status: 400 });
  }
  if (!episodeData || typeof episodeData.episode_number !== 'number') {
    return NextResponse.json({ error: 'episodeData.episode_number is required' }, { status: 400 });
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

  // 3) Create episode
  const { data: createdEpisode, error: episodeError } = await supabaseAdmin
    .from('videos')
    .insert([{ ...episodeData, anime_id: animeId }])
    .select()
    .single();

  if (episodeError) {
    console.error('❌ [API] Episode create error:', episodeError);
    return NextResponse.json({ error: episodeError.message, code: episodeError.code }, { status: 500 });
  }

  return NextResponse.json({ data: createdEpisode }, { status: 201 });
}

async function updateAnimeEpisode({
  episodeId,
  animeData,
  episodeData,
  genreIds,
}: {
  episodeId: string;
  animeData: any;
  episodeData: any;
  genreIds: string[];
}) {
  const { data: existingEpisode } = await supabaseAdmin
    .from('videos')
    .select('anime_id')
    .eq('id', episodeId)
    .single();

  const animeId = existingEpisode?.anime_id;
  if (!animeId) {
    return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
  }

  // Update anime metadata
  if (animeData) {
    await supabaseAdmin.from('anime').update(animeData).eq('id', animeId);
  }

  // Replace genres
  await supabaseAdmin.from('anime_genres').delete().eq('anime_id', animeId);
  if (genreIds && genreIds.length > 0) {
    await supabaseAdmin
      .from('anime_genres')
      .insert(genreIds.map((gid) => ({ anime_id: animeId, genre_id: gid })));
  }

  // Update episode
  const { data: updatedEpisode, error: episodeError } = await supabaseAdmin
    .from('videos')
    .update(episodeData)
    .eq('id', episodeId)
    .select()
    .single();

  if (episodeError) {
    console.error('❌ [API] Episode update error:', episodeError);
    return NextResponse.json({ error: episodeError.message, code: episodeError.code }, { status: 500 });
  }

  return NextResponse.json({ data: updatedEpisode }, { status: 200 });
}

async function deleteEpisode(episodeId: string) {
  const { error } = await supabaseAdmin.from('videos').delete().eq('id', episodeId);
  if (error) {
    console.error('❌ [API] Episode delete error:', error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
