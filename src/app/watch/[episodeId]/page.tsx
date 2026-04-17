'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';

type ServerKey = 'turbovip' | 'filedon';
type Quality = 480 | 720;

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.episodeId as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<ServerKey>('turbovip');
  const [selectedQuality, setSelectedQuality] = useState<Quality>(720);
  const [prevEpisode, setPrevEpisode] = useState<any>(null);
  const [nextEpisode, setNextEpisode] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: episodeData, error: episodeError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', episodeId)
        .single();

      if (episodeError || !episodeData) {
        setEpisode(null);
        setAnime(null);
        setPrevEpisode(null);
        setNextEpisode(null);
        setLoading(false);
        return;
      }

      setEpisode(episodeData);

      // Fetch anime details using anime_id
      if (episodeData.anime_id) {
        const { data: animeData } = await supabase
          .from('anime')
          .select('*')
          .eq('id', episodeData.anime_id)
          .single();

        setAnime(animeData);
      }

      // Fetch prev/next episodes based on episode_number order
      const currentAnimeId = episodeData.anime_id;
      const currentNumber = episodeData.episode_number;

      if (currentAnimeId && typeof currentNumber === 'number') {
        const { data: prevData } = await supabase
          .from('videos')
          .select('id, episode_number, episode_title')
          .eq('anime_id', currentAnimeId)
          .lt('episode_number', currentNumber)
          .order('episode_number', { ascending: false })
          .limit(1);

        const { data: nextData } = await supabase
          .from('videos')
          .select('id, episode_number, episode_title')
          .eq('anime_id', currentAnimeId)
          .gt('episode_number', currentNumber)
          .order('episode_number', { ascending: true })
          .limit(1);

        setPrevEpisode(prevData?.[0] ?? null);
        setNextEpisode(nextData?.[0] ?? null);
      }

      setLoading(false);
    };

    if (episodeId) {
      loadData();
    }
  }, [episodeId]);

  const selectedEmbedUrl = useMemo(() => {
    if (!episode) return null;

    if (selectedServer === 'turbovip') {
      return selectedQuality === 480 ? episode.embed_url_turbovip_480 : episode.embed_url_turbovip_720;
    }

    return selectedQuality === 480 ? episode.embed_url_filedon_480 : episode.embed_url_filedon_720;
  }, [episode, selectedServer, selectedQuality]);

  const selectedDownloadUrl = useMemo(() => {
    if (!episode) return null;

    if (selectedServer === 'turbovip') {
      return selectedQuality === 480 ? episode.download_url_turbovip_480 : episode.download_url_turbovip_720;
    }

    return selectedQuality === 480 ? episode.download_url_filedon_480 : episode.download_url_filedon_720;
  }, [episode, selectedServer, selectedQuality]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] text-gray-200 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Episode Tidak Ditemukan</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      {/* Navbar */}
      <nav className="bg-[#141519] border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-blue-500 italic">
            SAMEHADAKU<span className="text-white font-normal not-italic">CLONE</span>
          </Link>
          {anime && (
            <Link
              href={`/anime/${anime.slug || anime.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Kembali ke {anime.title}
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {anime?.title} - Episode {episode.episode_number}
          </h1>
          {episode.episode_title && (
            <p className="text-gray-400">{episode.episode_title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player Section */}
          <div className="lg:col-span-3">
            {/* Video Player Container */}
            <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-6">
              {selectedEmbedUrl ? (
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
                  <iframe
                    src={selectedEmbedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
                  <p className="text-gray-400">Embed URL belum tersedia untuk pilihan ini</p>
                </div>
              )}
            </div>

            {/* Server + Quality Selection */}
            <div className="bg-[#141519] p-4 rounded border border-gray-800 mb-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-3 font-semibold">Pilih Server:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedServer('turbovip')}
                    className={`py-2 px-3 rounded border transition text-sm font-semibold ${
                      selectedServer === 'turbovip'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c1e23] border-gray-700 text-gray-300 hover:border-blue-500'
                    }`}
                  >
                    TurboVIP
                  </button>
                  <button
                    onClick={() => setSelectedServer('filedon')}
                    className={`py-2 px-3 rounded border transition text-sm font-semibold ${
                      selectedServer === 'filedon'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c1e23] border-gray-700 text-gray-300 hover:border-blue-500'
                    }`}
                  >
                    FileDon
                  </button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-3 font-semibold">Pilih Kualitas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[720, 480].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuality(q as Quality)}
                      className={`py-2 px-3 rounded border transition text-sm font-semibold ${
                        selectedQuality === q
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#1c1e23] border-gray-700 text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {q}p
                    </button>
                  ))}
                </div>
              </div>

              {/* Download */}
              <div className="bg-[#1c1e23] border border-gray-700 rounded p-3">
                <p className="text-gray-300 text-sm font-semibold mb-2">Download ({selectedQuality}p)</p>
                {selectedDownloadUrl ? (
                  <a
                    href={selectedDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold text-white"
                  >
                    Download
                  </a>
                ) : (
                  <p className="text-gray-400 text-xs">Download URL belum tersedia untuk pilihan ini.</p>
                )}
              </div>
            </div>

            {/* Episode Info */}
            <div className="bg-[#141519] p-4 rounded border border-gray-800">
              <h3 className="text-lg font-bold mb-3 text-white">Informasi Episode</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Durasi:</span>{' '}
                  <span className="text-white">{Math.floor(episode.duration_seconds / 60)} menit</span>
                </p>
                <p>
                  <span className="text-gray-400">Views:</span>{' '}
                  <span className="text-white">{episode.views?.toLocaleString() || 0}</span>
                </p>
              </div>
            </div>

            {/* Prev/Next */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {prevEpisode ? (
                <Link
                  href={`/watch/${prevEpisode.id}`}
                  className="px-4 py-2 bg-[#141519] border border-gray-800 rounded hover:border-blue-500 transition text-sm font-semibold text-gray-200"
                >
                  ← Sebelumnya (Ep {prevEpisode.episode_number})
                </Link>
              ) : (
                <span className="px-4 py-2 bg-[#141519] border border-gray-800 rounded text-sm font-semibold text-gray-600">
                  Tidak ada episode sebelumnya
                </span>
              )}

              {nextEpisode ? (
                <Link
                  href={`/watch/${nextEpisode.id}`}
                  className="px-4 py-2 bg-[#141519] border border-gray-800 rounded hover:border-blue-500 transition text-sm font-semibold text-gray-200"
                >
                  Berikutnya (Ep {nextEpisode.episode_number}) →
                </Link>
              ) : (
                <span className="px-4 py-2 bg-[#141519] border border-gray-800 rounded text-sm font-semibold text-gray-600">
                  Tidak ada episode berikutnya
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
