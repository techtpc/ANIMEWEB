'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function QuickAddEpisodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [animes, setAnimes] = useState<any[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<any[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [filterDay, setFilterDay] = useState<number | null>(null); // 0=Senin, 6=Minggu
  const [searchQuery, setSearchQuery] = useState('');

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const [nextEpisode, setNextEpisode] = useState(1);

  // Form states
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Embed URLs
  const [turbovip480, setTurbovip480] = useState('');
  const [turbovip720, setTurbovip720] = useState('');
  const [filedon480, setFiledon480] = useState('');
  const [filedon720, setFiledon720] = useState('');

  // Download URLs
  const [dlTurbovip480, setDlTurbovip480] = useState('');
  const [dlTurbovip720, setDlTurbovip720] = useState('');
  const [dlFiledon480, setDlFiledon480] = useState('');
  const [dlFiledon720, setDlFiledon720] = useState('');

  // Duration & year
  const [durationSeconds, setDurationSeconds] = useState(1440); // 24 menit default
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());

  // Load animes
  useEffect(() => {
    const loadAnimes = async () => {
      const { data, error } = await supabase
        .from('anime')
        .select('id, title, slug, total_episodes, day_of_week')
        .order('title');
      
      if (!error && data) {
        setAnimes(data);
      }
    };
    loadAnimes();
  }, []);

  // Filter animes based on day and search
  useEffect(() => {
    let filtered = [...animes];

    // Filter by day
    if (filterDay !== null) {
      filtered = filtered.filter(a => a.day_of_week === filterDay);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query)
      );
    }

    setFilteredAnimes(filtered);
  }, [animes, filterDay, searchQuery]);

  // Auto-set next episode number when anime selected
  useEffect(() => {
    if (!selectedAnimeId) return;
    
    const loadNextEpisode = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('episode_number')
        .eq('anime_id', selectedAnimeId)
        .order('episode_number', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        const next = data.episode_number + 1;
        setEpisodeNumber(next);
        setNextEpisode(next);
      } else {
        setEpisodeNumber(1);
        setNextEpisode(1);
      }
    };

    loadNextEpisode();

    // Auto-fill thumbnail from anime
    const selectedAnime = animes.find(a => a.id === selectedAnimeId);
    if (selectedAnime) {
      // You'd need to fetch anime details to get thumbnail
    }
  }, [selectedAnimeId, animes]);

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault();
    if (!selectedAnimeId) {
      alert('Pilih anime dulu!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          anime_id: selectedAnimeId,
          episode_number: episodeNumber,
          episode_title: episodeTitle || null,
          title: `Episode ${episodeNumber}${episodeTitle ? ' - ' + episodeTitle : ''}`,
          thumbnail_url: thumbnailUrl || null,
          duration_seconds: durationSeconds,
          release_year: releaseYear,
          embed_url_turbovip_480: turbovip480 || null,
          embed_url_turbovip_720: turbovip720 || null,
          embed_url_filedon_480: filedon480 || null,
          embed_url_filedon_720: filedon720 || null,
          download_url_turbovip_480: dlTurbovip480 || null,
          download_url_turbovip_720: dlTurbovip720 || null,
          download_url_filedon_480: dlFiledon480 || null,
          download_url_filedon_720: dlFiledon720 || null,
          season_number: 1,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error:', error);
        alert('Gagal nambah episode: ' + error.message);
        setLoading(false);
        return;
      }

      alert(`✅ Episode ${episodeNumber} berhasil ditambahkan!`);

      if (saveAndAddAnother) {
        // Reset form for next episode
        setEpisodeNumber(nextEpisode + 1);
        setNextEpisode(nextEpisode + 1);
        setEpisodeTitle('');
        setTurbovip480('');
        setTurbovip720('');
        setFiledon480('');
        setFiledon720('');
        setDlTurbovip480('');
        setDlTurbovip720('');
        setDlFiledon480('');
        setDlFiledon720('');
        setLoading(false);
      } else {
        router.push('/admin/manage');
      }
    } catch (err) {
      console.error('Exception:', err);
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:text-blue-300"
        >
          ← Kembali
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Quick Add Episode</h1>
          <p className="text-slate-400">Tambah episode baru dengan cepat</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Select Anime with Filter */}
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-3">
          <label className="block text-sm font-bold text-white mb-2">Pilih Anime *</label>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilterDay(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterDay === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Semua
            </button>
            {dayNames.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFilterDay(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterDay === idx 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari anime..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />

          {/* Dropdown */}
          <select
            value={selectedAnimeId}
            onChange={(e) => setSelectedAnimeId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Anime ({filteredAnimes.length} tersedia) --</option>
            {(filterDay !== null ? filteredAnimes : animes).map(anime => (
              <option key={anime.id} value={anime.id}>
                {anime.title} ({anime.total_episodes || 0} eps)
                {anime.day_of_week !== null && anime.day_of_week !== undefined && 
                  ` - ${dayNames[anime.day_of_week]}`
                }
              </option>
            ))}
          </select>
        </div>

        {selectedAnimeId && (
          <>
            {/* Episode Info */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Info Episode</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nomor Episode *</label>
                  <input
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  />
                  <p className="text-xs text-slate-400 mt-1">Episode berikutnya: {nextEpisode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Judul Episode (Optional)</label>
                  <input
                    type="text"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="Episode Title"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Durasi (detik)</label>
                  <input
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  />
                  <p className="text-xs text-slate-400 mt-1">{Math.floor(durationSeconds / 60)} menit</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tahun Rilis</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>

            {/* Embed URLs - Quick Input */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Embed URLs</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-400 mb-1">TURBOVIP 480p</label>
                  <input
                    type="url"
                    value={turbovip480}
                    onChange={(e) => setTurbovip480(e.target.value)}
                    placeholder="Embed URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-400 mb-1">TURBOVIP 720p</label>
                  <input
                    type="url"
                    value={turbovip720}
                    onChange={(e) => setTurbovip720(e.target.value)}
                    placeholder="Embed URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">FILEDON 480p</label>
                  <input
                    type="url"
                    value={filedon480}
                    onChange={(e) => setFiledon480(e.target.value)}
                    placeholder="Embed URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">FILEDON 720p</label>
                  <input
                    type="url"
                    value={filedon720}
                    onChange={(e) => setFiledon720(e.target.value)}
                    placeholder="Embed URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Download URLs - Optional */}
            <details className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
              <summary className="text-lg font-bold text-white cursor-pointer">Download URLs (Optional)</summary>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-blue-400 mb-1">TURBOVIP 480p</label>
                  <input
                    type="url"
                    value={dlTurbovip480}
                    onChange={(e) => setDlTurbovip480(e.target.value)}
                    placeholder="Download URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-400 mb-1">TURBOVIP 720p</label>
                  <input
                    type="url"
                    value={dlTurbovip720}
                    onChange={(e) => setDlTurbovip720(e.target.value)}
                    placeholder="Download URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">FILEDON 480p</label>
                  <input
                    type="url"
                    value={dlFiledon480}
                    onChange={(e) => setDlFiledon480(e.target.value)}
                    placeholder="Download URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">FILEDON 720p</label>
                  <input
                    type="url"
                    value={dlFiledon720}
                    onChange={(e) => setDlFiledon720(e.target.value)}
                    placeholder="Download URL..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                  />
                </div>
              </div>
            </details>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳ Menyimpan...' : '✓ Simpan'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {loading ? '⏳' : '+ Simpan & Add Lagi'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/videos/new')}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg"
              >
                Form Lengkap
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
