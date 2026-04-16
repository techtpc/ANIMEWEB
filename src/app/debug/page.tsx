import { supabase } from '@/lib/supabase';

export default async function DebugPage() {
  // Get all anime
  const { data: anime, error: animeError } = await supabase
    .from('anime')
    .select('*');

  // Get all videos with anime_id
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('id, title, anime_id, episode_number, episode_title, release_year');

  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  // Get all video_servers
  const { data: videoServers, error: videoServersError } = await supabase
    .from('video_servers')
    .select(`
      id,
      video_id,
      server_name,
      embed_url,
      created_at,
      videos (id, title)
    `);

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-gray-200 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-500">🐛 Debug Database</h1>
      
      <div className="space-y-6 max-w-4xl">
        {/* Anime Section */}
        <div className="bg-[#141519] p-6 rounded border border-yellow-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">📺 Anime Table ({anime?.length || 0})</h2>
          {animeError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{animeError.message}</p>
              <p className="text-red-300 text-xs mt-2">
                <strong>Code:</strong> {animeError.code}
              </p>
              <p className="text-red-300 text-xs mt-1">
                <strong>Status:</strong> Tabel anime mungkin belum dibuat di database
              </p>
            </div>
          ) : anime && anime.length > 0 ? (
            <div className="space-y-3">
              {anime.map((a: any) => (
                <div key={a.id} className="bg-[#1c1e23] p-4 rounded border border-yellow-700">
                  <p className="font-bold text-yellow-300">📌 {a.title}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: <code className="bg-gray-900 px-2 py-1 rounded">{a.id}</code></p>
                  <p className="text-xs text-gray-400">Status: {a.status}</p>
                  <p className="text-xs text-gray-400">Total Episodes: {a.total_episodes}</p>
                  <p className="text-xs text-gray-400">Description: {a.description || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-orange-900/30 p-4 rounded border border-orange-700">
              <p className="text-orange-400 font-bold">⚠️ Tabel anime KOSONG!</p>
              <p className="text-orange-300 text-xs mt-2">
                Anda perlu jalankan SQL migration untuk membuat tabel anime.
                Buka file <code className="bg-gray-900 px-2 py-1 rounded">migrations-anime-episodes.sql</code>
              </p>
            </div>
          )}
        </div>

        {/* Videos Section with Anime ID */}
        <div className="bg-[#141519] p-6 rounded border border-blue-700">
          <h2 className="text-xl font-bold mb-4 text-blue-400">🎬 Videos - Check anime_id ({videos?.length || 0})</h2>
          {videosError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{videosError.message}</p>
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="space-y-3">
              {videos.map((video: any) => (
                <div key={video.id} className={`p-4 rounded border ${video.anime_id ? 'border-green-700 bg-[#1c1e23]' : 'border-red-700 bg-red-900/20'}`}>
                  <p className="font-bold text-blue-300">{video.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Video ID: <code className="bg-gray-900 px-2 py-1 rounded">{video.id}</code></p>
                  <p className={`text-xs mt-2 ${video.anime_id ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                    anime_id: {video.anime_id ? <code className="bg-gray-900 px-2 py-1 rounded">{video.anime_id}</code> : '❌ TIDAK ADA (PERLU DI-SET)'}
                  </p>
                  <p className="text-xs text-gray-400">Episode #: {video.episode_number || 'N/A'}</p>
                  <p className="text-xs text-gray-400">Episode Title: {video.episode_title || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-400">⚠️ Tidak ada video ditemukan</p>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-[#141519] p-6 rounded border border-purple-700">
          <h2 className="text-xl font-bold mb-4 text-purple-400">📂 Categories ({categories?.length || 0})</h2>
          {categoriesError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{categoriesError.message}</p>
            </div>
          ) : categories && categories.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {categories.map((cat: any) => (
                <li key={cat.id} className="text-gray-300">{cat.name} ({cat.slug})</li>
              ))}
            </ul>
          ) : (
            <p className="text-yellow-400">⚠️ Tidak ada category</p>
          )}
        </div>

        {/* Video Servers Section */}
        <div className="bg-[#141519] p-6 rounded border border-cyan-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">🎯 Video Servers ({videoServers?.length || 0})</h2>
          {videoServersError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{videoServersError.message}</p>
            </div>
          ) : videoServers && videoServers.length > 0 ? (
            <div className="space-y-3">
              {videoServers.map((server: any) => (
                <div key={server.id} className="p-4 rounded border border-cyan-700 bg-[#1c1e23]">
                  <p className="font-bold text-cyan-300">{server.server_name}</p>
                  <p className="text-xs text-gray-400 mt-1">Video ID: <code className="bg-gray-900 px-2 py-1 rounded">{server.video_id}</code></p>
                  <p className="text-xs text-gray-400 mt-1">Video Title: {server.videos?.title || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-2">Embed URL: <code className="bg-gray-900 px-2 py-1 rounded text-cyan-300 break-all">{server.embed_url}</code></p>
                  <p className="text-xs text-gray-500 mt-1">Created: {new Date(server.created_at).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-900/20 p-4 rounded border border-red-700">
              <p className="text-yellow-400">⚠️ Tidak ada video server ditemukan</p>
              <p className="text-red-300 text-xs mt-2">
                <strong>Solusi:</strong><br/>
                1. Buka Supabase → SQL Editor<br/>
                2. Run query dari file SETUP_VIDEO_SERVERS_RLS.sql<br/>
                3. Pastikan INSERT statements dijalankan dengan video_id yang benar<br/>
                4. Refresh halaman ini untuk melihat data baru
              </p>
            </div>
          )}
        </div>

        {/* Troubleshooting Section */}
        <div className="bg-[#141519] p-6 rounded border border-yellow-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">📋 Troubleshooting</h2>
          <div className="space-y-3 text-sm">
            <p className="text-gray-300">
              <strong>Jika anime table kosong:</strong><br />
              1. Buka Supabase Dashboard → SQL Editor<br />
              2. Copy-paste query dari <code className="bg-gray-900 px-2 py-1 rounded">migrations-anime-episodes.sql</code><br />
              3. Run query
            </p>
            <p className="text-gray-300 mt-3">
              <strong>Jika anime_id video kosong:</strong><br />
              1. Buka Supabase → Table videos<br />
              2. Edit video, set anime_id dengan ID dari anime table<br />
              3. Set episode_number dan episode_title
            </p>
            <p className="text-gray-300 mt-3">
              <strong>Jika Video Servers kosong:</strong><br />
              1. Pastikan video_servers table sudah memiliki RLS policy<br />
              2. Buka Supabase → SQL Editor<br />
              3. Copy video_id dari Videos section di atas<br />
              4. Run query dari <code className="bg-gray-900 px-2 py-1 rounded">SETUP_VIDEO_SERVERS_RLS.sql</code> dengan video_id yang benar<br />
              5. Pastikan embed_url menggunakan protocol https://
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
