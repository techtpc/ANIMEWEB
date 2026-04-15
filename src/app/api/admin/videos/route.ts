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
    const { action, videoData, videoId, categoryId, serverId, platform } = body;

    if (action === 'create') {
      return await createVideo(videoData);
    } else if (action === 'update') {
      return await updateVideo(videoId, videoData);
    } else if (action === 'delete') {
      return await deleteVideo(videoId);
    } else if (action === 'addCategory') {
      return await addVideoCategory(videoId, categoryId);
    } else if (action === 'removeCategory') {
      return await removeVideoCategory(videoId, categoryId);
    } else if (action === 'addServer') {
      return await addVideoServer(videoId, platform);
    } else if (action === 'removeServer') {
      return await removeVideoServer(serverId);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('❌ [API] Exception:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

async function createVideo(videoData: any) {
  console.log('📝 [API] Creating video:', videoData);

  const { data, error } = await supabaseAdmin
    .from('videos')
    .insert([videoData])
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error creating video:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Video created:', data);
  return NextResponse.json({ data }, { status: 201 });
}

async function updateVideo(videoId: string, videoData: any) {
  console.log('📝 [API] Updating video:', videoId, videoData);

  const { data, error } = await supabaseAdmin
    .from('videos')
    .update(videoData)
    .eq('id', videoId)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error updating video:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Video updated:', data);
  return NextResponse.json({ data }, { status: 200 });
}

async function deleteVideo(videoId: string) {
  console.log('📝 [API] Deleting video:', videoId);

  const { error } = await supabaseAdmin
    .from('videos')
    .delete()
    .eq('id', videoId);

  if (error) {
    console.error('❌ [API] Error deleting video:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Video deleted');
  return NextResponse.json({ success: true }, { status: 200 });
}

async function addVideoCategory(videoId: string, categoryId: string) {
  console.log('📝 [API] Adding category to video:', { videoId, categoryId });

  const { data, error } = await supabaseAdmin
    .from('video_categories')
    .insert([{ video_id: videoId, category_id: categoryId }])
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error adding category:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Category added:', data);
  return NextResponse.json({ data }, { status: 201 });
}

async function removeVideoCategory(videoId: string, categoryId: string) {
  console.log('📝 [API] Removing category from video:', { videoId, categoryId });

  const { error } = await supabaseAdmin
    .from('video_categories')
    .delete()
    .eq('video_id', videoId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('❌ [API] Error removing category:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Category removed');
  return NextResponse.json({ success: true }, { status: 200 });
}

async function addVideoServer(videoId: string, platform: any) {
  console.log('📝 [API] Adding server to video:', { videoId, platform });

  const { data, error } = await supabaseAdmin
    .from('video_servers')
    .insert([{ video_id: videoId, server_name: platform.name, embed_url: platform.url }])
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error adding server:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Server added:', data);
  return NextResponse.json({ data }, { status: 201 });
}

async function removeVideoServer(serverId: string) {
  console.log('📝 [API] Removing server:', serverId);

  const { error } = await supabaseAdmin
    .from('video_servers')
    .delete()
    .eq('id', serverId);

  if (error) {
    console.error('❌ [API] Error removing server:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ [API] Server removed');
  return NextResponse.json({ success: true }, { status: 200 });
}
