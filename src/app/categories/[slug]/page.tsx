'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import AnimeCard from '@/components/AnimeCard';
import { supabase } from '@/lib/supabase';

export default function GenreDetailPage() {
  const params = useParams();
  const genreSlug = params.slug as string;

  const [genre, setGenre] = useState<any>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Fetch genre info
      const { data: genreData, error: genreError } = await supabase
        .from('genres')
        .select('*')
        .eq('slug', genreSlug)
        .single();

      if (genreError || !genreData) {
        setLoading(false);
        return;
      }

      setGenre(genreData);

      // Fetch anime linked to this genre via anime_genres
      const { data: animeGenresData, error: agError } = await supabase
        .from('anime_genres')
        .select(`
          anime (
            id,
            title,
            slug,
            thumbnail_url,
            release_year,
            status,
            day_of_week,
            anime_genres (
              genres (id, name, slug)
            ),
            videos (episode_number)
          )
        `)
        .eq('genre_id', genreData.id);

      if (!agError && animeGenresData) {
        // Extract and deduplicate anime
        const animeMap = new Map<string, any>();
        animeGenresData.forEach((ag: any) => {
          if (ag.anime && !animeMap.has(ag.anime.id)) {
            animeMap.set(ag.anime.id, ag.anime);
          }
        });
        const sortedAnime = Array.from(animeMap.values()).sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setAnimeList(sortedAnime);
      }

      setLoading(false);
    };

    if (genreSlug) {
      loadData();
    }
  }, [genreSlug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
        <PublicNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  if (!genre) {
    return (
      <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
        <PublicNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Genre Tidak Ditemukan</h1>
            <Link href="/categories" className="text-blue-400 hover:text-blue-300">
              Kembali ke Daftar Genre
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/categories"
                className="text-blue-400 hover:text-blue-300 transition text-sm"
              >
                ← Genre
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400 text-sm">{genre.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Genre: {genre.name}</h1>
            <p className="text-gray-400 mt-2">
              {animeList.length} anime ditemukan
            </p>
          </div>
        </div>

        {animeList.length === 0 ? (
          <div className="bg-[#141519] border border-gray-800 p-12 rounded-xl text-center">
            <p className="text-gray-400">Belum ada anime dengan genre ini.</p>
          </div>
        ) : (
          <>
            {/* Mobile: Title-only list */}
            <div className="block sm:hidden space-y-1">
              {animeList.map((anime: any) => {
                const href = anime?.slug
                  ? `/anime/${anime.slug}`
                  : `/anime/${anime?.id}`;

                return (
                  <Link
                    key={anime.id}
                    href={href}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 bg-[#141519] border border-gray-800 rounded hover:border-blue-500 hover:bg-[#1c1e23] transition-all group"
                  >
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {anime.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {anime.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          anime.status === 'ongoing'
                            ? 'bg-red-900/50 text-red-300 border border-red-700'
                            : 'bg-green-900/50 text-green-300 border border-green-700'
                        }`}>
                          {anime.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                        </span>
                      )}
                      {anime.release_year && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                          {anime.release_year}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop/Tablet: Card grid */}
            <div className="hidden sm:grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {animeList.map((anime: any) => (
                <AnimeCard key={anime.id} video={anime} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
