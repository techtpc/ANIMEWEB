'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';

interface Resolution {
  name: string;
  label: string;
  url: string;
}

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.episodeId as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [selectedResolution, setSelectedResolution] = useState<string>('');

  // Mock resolutions - dalam praktik akan dari database
  const mockResolutions: Resolution[] = [
    { name: '360p', label: '360p (Low)', url: '?quality=360' },
    { name: '480p', label: '480p (Medium)', url: '?quality=480' },
    { name: '720p', label: '720p (HD)', url: '?quality=720' },
    { name: '1080p', label: '1080p (Full HD)', url: '?quality=1080' },
  ];

  useEffect(() => {
    const loadData = async () => {
      // Fetch episode details
      const { data: episodeData, error: episodeError } = await supabase
        .from('videos')
        .select(`
          *,
          video_categories (
            categories (name)
          ),
          video_tags (
            tags (name)
          ),
          video_servers (
            id,
            server_name,
            embed_url
          )
        `)
        .eq('id', episodeId)
        .single();

      if (episodeError) {
        // Handle error silently
      } else if (episodeData) {
        setEpisode(episodeData);

        // Fetch anime details using anime_id
        if (episodeData.anime_id) {
          const { data: animeData } = await supabase
            .from('anime')
            .select('*')
            .eq('id', episodeData.anime_id)
            .single();

          if (animeData) {
            setAnime(animeData);
          }
        }

        // Set default server
        if (episodeData.video_servers && episodeData.video_servers.length > 0) {
          setSelectedServer(episodeData.video_servers[0]);
        }
      }

      setLoading(false);
    };

    if (episodeId) {
      loadData();
    }
  }, [episodeId]);

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
              href={`/anime/${anime.id}`}
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
              {selectedServer ? (
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
                  <iframe
                    src={selectedServer.embed_url + (selectedResolution || '')}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gray-900 flex items-center justify-center">
                  <p className="text-gray-400">No server available</p>
                </div>
              )}
            </div>

            {/* Resolution Selection */}
            <div className="bg-[#141519] p-4 rounded border border-gray-800 mb-6">
              <p className="text-gray-400 text-sm mb-3 font-semibold">Pilih Resolusi:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {mockResolutions.map((res) => (
                  <button
                    key={res.name}
                    onClick={() => setSelectedResolution(res.url)}
                    className={`py-2 px-3 rounded border transition text-sm font-semibold ${
                      selectedResolution === res.url
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c1e23] border-gray-700 text-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
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
                {episode.video_categories && episode.video_categories.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genre: </span>
                    <span className="text-white">
                      {episode.video_categories
                        .map((vc: any) => vc.categories?.name)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Server Selection */}
          <div>
            <div className="bg-[#141519] p-4 rounded border border-gray-800 sticky top-20">
              <p className="text-gray-400 text-sm mb-3 font-semibold">Pilih Server:</p>
              <div className="space-y-2">
                {!episode.video_servers || episode.video_servers.length === 0 ? (
                  <p className="text-gray-400 text-xs">Belum ada server tersedia</p>
                ) : (
                  episode.video_servers.map((server: any) => (
                    <button
                      key={server.id}
                      onClick={() => setSelectedServer(server)}
                      className={`w-full py-2 px-3 rounded border transition text-sm font-semibold ${
                        selectedServer?.id === server.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#1c1e23] border-gray-700 text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {server.server_name || 'Server'}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
