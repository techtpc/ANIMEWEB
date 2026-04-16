'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Anime, Episode } from '@/types';

export default function AnimeDetailPage() {
  const params = useParams();
  const animeId = params.slug as string;
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const animeIdentifier = params.slug as string;
      
      // Try to fetch anime - could be either slug or ID
      let animeQueryError = true;
      let animeData = null;
      
      // First try by slug
      const { data: slugData, error: slugError } = await supabase
        .from('anime')
        .select('*')
        .eq('slug', animeIdentifier)
        .single();
      
      if (!slugError && slugData) {
        animeData = slugData;
        animeQueryError = false;
      } else {
        // If not found by slug, try by ID
        const { data: idData, error: idError } = await supabase
          .from('anime')
          .select('*')
          .eq('id', animeIdentifier)
          .single();
        
        if (!idError && idData) {
          animeData = idData;
          animeQueryError = false;
        }
      }

      if (!animeQueryError && animeData) {
        setAnime(animeData);

        // Fetch episodes for this anime
        const { data: episodesData, error: episodesError } = await supabase
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
          .eq('anime_id', animeData.id)
          .order('episode_number', { ascending: true });

        if (!episodesError && episodesData) {
          setEpisodes(episodesData);
        }
      }

      setLoading(false);
    };

    if (params.slug) {
      loadData();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] text-gray-200 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Anime Tidak Ditemukan</h1>
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
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition">
            ← Kembali
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Detail Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Thumbnail */}
          <div className="md:col-span-1">
            {anime.thumbnail_url && (
              <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={anime.thumbnail_url}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-3">
            <h1 className="text-4xl font-bold mb-4 text-white">{anime.title}</h1>

            {/* Meta Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Status:</span>
                <span className="px-3 py-1 bg-blue-900/30 border border-blue-600 rounded text-blue-300 text-sm font-semibold">
                  {anime.status === 'ongoing' && '🔴 Ongoing'}
                  {anime.status === 'completed' && '✅ Completed'}
                  {anime.status === 'upcoming' && '⏰ Upcoming'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-400">Tahun:</span>
                <span className="text-white">{anime.release_year || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-400">Total Episode:</span>
                <span className="text-white">{anime.total_episodes}</span>
              </div>

              {/* Categories */}
              {anime.video_categories && anime.video_categories.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">Genre:</span>
                  <div className="flex flex-wrap gap-2">
                    {anime.video_categories.map((vc: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-900/30 border border-purple-600 rounded text-purple-300 text-sm"
                      >
                        {vc.categories.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {anime.description && (
              <div className="bg-[#141519] p-4 rounded border border-gray-800">
                <p className="text-gray-300 leading-relaxed">{anime.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Episodes Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-blue-600"></span>
            Daftar Episode ({episodes.length})
          </h2>

          {episodes.length === 0 ? (
            <div className="bg-[#141519] p-8 rounded border border-gray-800 text-center">
              <p className="text-gray-400">Belum ada episode untuk anime ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/watch/${episode.id}`}
                  className="block p-3 bg-[#141519] border border-gray-800 rounded hover:bg-[#1c1e23] hover:border-blue-500 transition"
                >
                  <p className="text-gray-300 hover:text-blue-400 transition">
                    <span className="font-semibold">{anime?.title}</span> Episode {episode.episode_number}
                    {episode.episode_title && ` - ${episode.episode_title}`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}