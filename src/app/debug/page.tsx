import { supabase } from '@/lib/supabase';

export default async function DebugPage() {
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Get all anime
  const { data: anime, error: animeError } = await supabase.from('anime').select('*');

  // Get all episodes (videos) with embed/download fields
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      anime_id,
      episode_number,
      episode_title,
      season_number,
      thumbnail_url,
      duration_seconds,
      views,
      release_year,
      created_at,

      embed_url_turbovip_480,
      embed_url_turbovip_720,
      embed_url_filedon_480,
      embed_url_filedon_720,

      download_url_turbovip_480,
      download_url_turbovip_720,
      download_url_filedon_480,
      download_url_filedon_720
    `);

  // Get all genres
  const { data: genres, error: genresError } = await supabase
    .from('genres')
    .select('*')
    .order('name');

  // Get anime<->genre relations
  const { data: animeGenres, error: animeGenresError } = await supabase
    .from('anime_genres')
    .select(`
      anime_id,
      genres (id, name, slug)
    `);

  const formatDay = (dayOfWeek: any) => {
    if (typeof dayOfWeek !== 'number') return 'N/A';
    return dayNames[dayOfWeek] || 'N/A';
  };

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
                  {a.status === 'ongoing' && (
                    <p className="text-xs text-gray-400">Day: {formatDay(a.day_of_week)}</p>
                  )}
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
          <h2 className="text-xl font-bold mb-4 text-blue-400">🎬 Episodes (videos) ({videos?.length || 0})</h2>
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

                  <div className="mt-2 text-xs text-gray-300 space-y-1">
                    <p>Embed TurboVIP: 480 {video.embed_url_turbovip_480 ? '✓' : '✗'} | 720 {video.embed_url_turbovip_720 ? '✓' : '✗'}</p>
                    <p>Embed FileDon: 480 {video.embed_url_filedon_480 ? '✓' : '✗'} | 720 {video.embed_url_filedon_720 ? '✓' : '✗'}</p>
                    <p>Download TurboVIP: 480 {video.download_url_turbovip_480 ? '✓' : '✗'} | 720 {video.download_url_turbovip_720 ? '✓' : '✗'}</p>
                    <p>Download FileDon: 480 {video.download_url_filedon_480 ? '✓' : '✗'} | 720 {video.download_url_filedon_720 ? '✓' : '✗'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-400">⚠️ Tidak ada video ditemukan</p>
          )}
        </div>

        {/* Genres Section */}
        <div className="bg-[#141519] p-6 rounded border border-purple-700">
          <h2 className="text-xl font-bold mb-4 text-purple-400">📂 Genres ({genres?.length || 0})</h2>
          {genresError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{genresError.message}</p>
            </div>
          ) : genres && genres.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {genres.map((cat: any) => (
                <li key={cat.id} className="text-gray-300">{cat.name} ({cat.slug})</li>
              ))}
            </ul>
          ) : (
            <p className="text-yellow-400">⚠️ Tidak ada genre</p>
          )}
        </div>

        {/* Anime-Genres Section */}
        <div className="bg-[#141519] p-6 rounded border border-cyan-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">🔗 anime_genres ({animeGenres?.length || 0})</h2>
          {animeGenresError ? (
            <div className="bg-red-900/30 p-4 rounded border border-red-700">
              <p className="text-red-400 font-mono text-sm">{animeGenresError.message}</p>
            </div>
          ) : animeGenres && animeGenres.length > 0 ? (
            <div className="space-y-2">
              {animeGenres.slice(0, 30).map((rel: any, idx: number) => (
                <div key={`${rel.anime_id}-${rel.genres?.id}-${idx}`} className="text-xs text-gray-300">
                  anime_id: <code className="bg-gray-900 px-2 py-1 rounded text-gray-200">{rel.anime_id}</code> → genre: <span className="text-cyan-300 font-semibold">{rel.genres?.name}</span>
                </div>
              ))}
              {animeGenres.length > 30 && <p className="text-xs text-gray-500">... (dipotong 30 baris)</p>}
            </div>
          ) : (
            <div className="bg-red-900/20 p-4 rounded border border-red-700">
              <p className="text-yellow-400">⚠️ Tidak ada relasi anime_genres</p>
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
              <strong>Jika embed/download di watch page kosong:</strong><br />
              1. Buka Supabase → Table videos<br />
              2. Temukan episode (ID dari bagian Episodes di atas)<br />
              3. Isi field embed_url_* (TurboVIP/FileDon x 480/720)<br />
              4. Isi field download_url_* (TurboVIP/FileDon x 480/720)<br />
              5. Pastikan URL memakai protocol <code className="bg-gray-900 px-2 py-1 rounded">https://</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
