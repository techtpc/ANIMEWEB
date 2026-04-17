/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCategories } from '@/lib/admin-queries';

type AnimeStatus = 'ongoing' | 'completed';

const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

interface EpisodeAnimeFormProps {
  videoId?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function EpisodeAnimeForm({ videoId, initialData, onSuccess }: EpisodeAnimeFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [animeData, setAnimeData] = useState({
    title: '',
    slug: '',
    thumbnail_url: '',
    description: '',
    release_year: new Date().getFullYear(),
    status: 'ongoing' as AnimeStatus,
    day_of_week: 0 as number | null,
    total_episodes: 0,
  });

  const [episodeData, setEpisodeData] = useState({
    title: '',
    episode_number: 1,
    episode_title: '',
    season_number: 1,
    duration_seconds: 0,
    views: 0,
    release_year: undefined as number | undefined,
    // TurboVIP embeds + downloads
    embed_url_turbovip_480: '',
    embed_url_turbovip_720: '',
    download_url_turbovip_480: '',
    download_url_turbovip_720: '',
    // FileDon embeds + downloads
    embed_url_filedon_480: '',
    embed_url_filedon_720: '',
    download_url_filedon_480: '',
    download_url_filedon_720: '',
  });

  const canSetDayOfWeek = useMemo(() => animeData.status === 'ongoing', [animeData.status]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const genresData = await getCategories();
        setGenres(genresData);

        if (videoId) {
          // initialData may already contain episode fields, but anime fields likely not.
          const episodeRow = initialData?.anime_id ? initialData : await fetchEpisode(videoId);
          if (episodeRow) {
            setEpisodeData((prev) => ({
              ...prev,
              episode_number: episodeRow.episode_number ?? prev.episode_number,
              episode_title: episodeRow.episode_title ?? prev.episode_title,
              title: episodeRow.title ?? prev.title,
              season_number: episodeRow.season_number ?? prev.season_number,
              duration_seconds: episodeRow.duration_seconds ?? prev.duration_seconds,
              views: episodeRow.views ?? prev.views,
              release_year: episodeRow.release_year ?? prev.release_year,
              embed_url_turbovip_480: episodeRow.embed_url_turbovip_480 ?? '',
              embed_url_turbovip_720: episodeRow.embed_url_turbovip_720 ?? '',
              embed_url_filedon_480: episodeRow.embed_url_filedon_480 ?? '',
              embed_url_filedon_720: episodeRow.embed_url_filedon_720 ?? '',
              download_url_turbovip_480: episodeRow.download_url_turbovip_480 ?? '',
              download_url_turbovip_720: episodeRow.download_url_turbovip_720 ?? '',
              download_url_filedon_480: episodeRow.download_url_filedon_480 ?? '',
              download_url_filedon_720: episodeRow.download_url_filedon_720 ?? '',
            }));

            const animeId = episodeRow.anime_id;
            if (animeId) {
              const animeRow = await fetchAnime(animeId);
              if (animeRow) {
                setAnimeData({
                  title: animeRow.title ?? '',
                  slug: animeRow.slug ?? '',
                  thumbnail_url: animeRow.thumbnail_url ?? '',
                  description: animeRow.description ?? '',
                  release_year: animeRow.release_year ?? new Date().getFullYear(),
                  status: animeRow.status ?? 'ongoing',
                  day_of_week: animeRow.day_of_week ?? null,
                  total_episodes: animeRow.total_episodes ?? 0,
                });

                const genreIds = (animeRow.anime_genres || [])
                  .map((ag: any) => ag.genres?.id)
                  .filter(Boolean);
                setSelectedGenres(genreIds);
              }
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const fetchEpisode = async (id: string) => {
    const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  };

  const fetchAnime = async (id: string) => {
    const { data, error } = await supabase
      .from('anime')
      .select(`
        *,
        anime_genres (genres (id, name, slug))
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  };

  const handleToggleGenre = (genreId: string) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((x) => x !== genreId) : [...prev, genreId]));
  };

  const [newGenreName, setNewGenreName] = useState('');
  const handleAddGenre = async () => {
    const trimmed = newGenreName.trim();
    if (!trimmed) return;

    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, slug }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || 'Gagal menambah genre');
        return;
      }

      if (result.data?.id) {
        setGenres((prev) => [...prev, result.data]);
        setSelectedGenres((prev) => (prev.includes(result.data.id) ? prev : [...prev, result.data.id]));
        setNewGenreName('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!animeData.title.trim()) return alert('Judul anime wajib diisi');
    if (!animeData.slug.trim()) return alert('Slug anime wajib diisi');
    if (!animeData.thumbnail_url.trim()) return alert('Thumbnail URL wajib diisi');
    if (!episodeData.episode_number || episodeData.episode_number < 1) return alert('episode_number wajib >= 1');
    if (animeData.status === 'ongoing' && dayNames[animeData.day_of_week ?? -1] === undefined) return alert('day_of_week belum valid');

    const payloadAnime = {
      ...animeData,
      day_of_week: animeData.status === 'ongoing' ? animeData.day_of_week : null,
      // total_episodes dihitung manual/di code nanti; untuk sekarang biarkan dari form
    };

    const derivedEpisodeTitle =
      (episodeData.episode_title || '').trim() ||
      (episodeData.title || '').trim() ||
      `${animeData.title} Episode ${episodeData.episode_number}`;

    const payloadEpisode = {
      title: derivedEpisodeTitle,
      episode_number: episodeData.episode_number,
      episode_title: episodeData.episode_title || null,
      season_number: episodeData.season_number,
      duration_seconds: episodeData.duration_seconds,
      views: episodeData.views,
      release_year: episodeData.release_year ?? null,

      embed_url_turbovip_480: episodeData.embed_url_turbovip_480 || null,
      embed_url_turbovip_720: episodeData.embed_url_turbovip_720 || null,
      embed_url_filedon_480: episodeData.embed_url_filedon_480 || null,
      embed_url_filedon_720: episodeData.embed_url_filedon_720 || null,

      download_url_turbovip_480: episodeData.download_url_turbovip_480 || null,
      download_url_turbovip_720: episodeData.download_url_turbovip_720 || null,
      download_url_filedon_480: episodeData.download_url_filedon_480 || null,
      download_url_filedon_720: episodeData.download_url_filedon_720 || null,
    };

    setLoading(true);
    try {
      const action = videoId ? 'update' : 'create';
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          episodeId: videoId,
          animeData: payloadAnime,
          episodeData: payloadEpisode,
          genreIds: selectedGenres,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || 'Gagal menyimpan');
        return;
      }

      alert(videoId ? 'Episode berhasil diperbarui!' : 'Episode berhasil ditambahkan!');
      onSuccess?.();
      if (!onSuccess) router.push('/admin/manage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-hidden flex flex-col bg-[#0b0c0f]">
      <div className="flex gap-4 flex-1 min-h-0 p-4">
        {/* LEFT COLUMN: Anime */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 pr-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Judul Anime</label>
              <input
                type="text"
                value={animeData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newSlug = newTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  setAnimeData((p) => ({ ...p, title: newTitle, slug: newSlug }));
                }}
                placeholder="One Piece"
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Slug</label>
              <input
                type="text"
                value={animeData.slug}
                onChange={(e) => setAnimeData((p) => ({ ...p, slug: e.target.value }))}
                placeholder="one-piece"
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Auto-generated dari judul. Edit jika perlu.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Tahun</label>
              <input
                type="number"
                value={animeData.release_year}
                onChange={(e) => setAnimeData((p) => ({ ...p, release_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              Thumbnail URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={animeData.thumbnail_url}
              onChange={(e) => setAnimeData((p) => ({ ...p, thumbnail_url: e.target.value }))}
              placeholder="https://..."
              required
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Status</label>
            <select
              value={animeData.status}
              onChange={(e) => setAnimeData((p) => ({ ...p, status: e.target.value as AnimeStatus }))}
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            >
              <option value="ongoing">ongoing</option>
              <option value="completed">completed</option>
            </select>
          </div>

          {canSetDayOfWeek && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Hari Rilis (day_of_week)</label>
              <select
                value={animeData.day_of_week ?? 0}
                onChange={(e) => setAnimeData((p) => ({ ...p, day_of_week: parseInt(e.target.value) }))}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                {dayNames.map((d, idx) => (
                  <option key={d} value={idx}>
                    {d} ({idx})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Description</label>
            <textarea
              value={animeData.description}
              onChange={(e) => setAnimeData((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-xs"
              placeholder="Deskripsi anime..."
            />
          </div>

          {/* Genres */}
          <div className="bg-slate-700/50 border border-slate-600 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-white mb-2 uppercase">Genres</h4>
            <div className="grid grid-cols-2 gap-1 mb-2 max-h-28 overflow-y-auto">
              {genres.length === 0 ? (
                <p className="text-slate-400 text-xs col-span-2">Belum ada genre</p>
              ) : (
                genres.map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-2 p-1 hover:bg-slate-600 rounded cursor-pointer transition text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g.id)}
                      onChange={() => handleToggleGenre(g.id)}
                      className="w-3 h-3 text-blue-600 border-slate-500 rounded"
                    />
                    <span className="text-slate-200">{g.name}</span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                placeholder="Tambah genre baru..."
                className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <button
                type="button"
                onClick={handleAddGenre}
                disabled={loading || !newGenreName.trim()}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-semibold transition text-xs whitespace-nowrap"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Episode */}
        <div className="w-96 flex flex-col gap-3">
          <div className="bg-[#0f1117] border border-slate-800 rounded-lg p-3 overflow-y-auto space-y-3">
            <h3 className="text-sm font-bold text-white uppercase">Episode</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Episode #</label>
                <input
                  type="number"
                  value={episodeData.episode_number}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, episode_number: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Season</label>
                <input
                  type="number"
                  value={episodeData.season_number}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, season_number: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Episode Title</label>
              <input
                type="text"
                value={episodeData.episode_title}
                onChange={(e) => setEpisodeData((p) => ({ ...p, episode_title: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                placeholder="Judul episode (opsional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Durasi (s)</label>
                <input
                  type="number"
                  value={episodeData.duration_seconds}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, duration_seconds: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Views</label>
                <input
                  type="number"
                  value={episodeData.views}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, views: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <h4 className="text-xs font-bold text-white uppercase mb-2">TurboVIP</h4>
              <div className="space-y-2">
                <label className="text-[11px] text-slate-300 block">Embed 480p</label>
                <input
                  type="url"
                  value={episodeData.embed_url_turbovip_480}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, embed_url_turbovip_480: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Embed 720p</label>
                <input
                  type="url"
                  value={episodeData.embed_url_turbovip_720}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, embed_url_turbovip_720: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Download 480p</label>
                <input
                  type="url"
                  value={episodeData.download_url_turbovip_480}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, download_url_turbovip_480: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Download 720p</label>
                <input
                  type="url"
                  value={episodeData.download_url_turbovip_720}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, download_url_turbovip_720: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <h4 className="text-xs font-bold text-white uppercase mb-2">FileDon</h4>
              <div className="space-y-2">
                <label className="text-[11px] text-slate-300 block">Embed 480p</label>
                <input
                  type="url"
                  value={episodeData.embed_url_filedon_480}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, embed_url_filedon_480: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Embed 720p</label>
                <input
                  type="url"
                  value={episodeData.embed_url_filedon_720}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, embed_url_filedon_720: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Download 480p</label>
                <input
                  type="url"
                  value={episodeData.download_url_filedon_480}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, download_url_filedon_480: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
                <label className="text-[11px] text-slate-300 block">Download 720p</label>
                <input
                  type="url"
                  value={episodeData.download_url_filedon_720}
                  onChange={(e) => setEpisodeData((p) => ({ ...p, download_url_filedon_720: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-600 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition text-sm"
            >
              {loading ? '⏳' : videoId ? '✓ Update' : '✓ Simpan'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition text-sm"
            >
              ✕ Batal
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

