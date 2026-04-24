import { supabase } from '@/lib/supabase';
import AnimeCard from '@/components/AnimeCard';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default async function VideosPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams?.page === 'string' ? Number(resolvedParams.page) : 1;
  const currentPage = !Number.isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const selectQuery = `
    *,
    anime_genres (
      genres (id, name, slug)
    )
  `;

  const { data: animeList, count } = await supabase
    .from('anime')
    .select(selectQuery, { count: 'exact' })
    .order('title', { ascending: true })
    .range(from, to);

  const totalItems = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pageHref = (page: number) => `/videos?page=${page}`;

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Anime List</h1>
            <p className="text-gray-400 mt-2">
              Total: {totalItems} anime • Halaman {currentPage} dari {totalPages}
            </p>
          </div>

          <span className="px-4 py-2 rounded-md border border-gray-800 text-sm font-semibold text-gray-300 bg-[#141519]">
            Urut A-Z
          </span>
        </div>

        {!animeList || animeList.length === 0 ? (
          <div className="bg-[#141519] border border-gray-800 p-12 rounded-xl text-center">
            <p className="text-gray-400">Belum ada anime untuk section ini.</p>
          </div>
        ) : (
          <>
            {/* Mobile: Title-only list */}
            <div className="block sm:hidden space-y-1">
              {animeList.map((anime: any) => {
                const href = anime?.slug
                  ? `/anime/${anime.slug}`
                  : `/anime/${anime?.id}`;
                const genreName =
                  anime?.anime_genres?.[0]?.genres?.name || '';

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
                      {genreName && (
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                          {genreName}
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
            <div className="hidden sm:grid grid-cols-4 lg:grid-cols-6 gap-3">
              {animeList.map((anime: any) => (
                <AnimeCard key={anime.id} video={anime} />
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-3 pt-4">
          {hasPrev ? (
            <Link
              href={pageHref(currentPage - 1)}
              className="px-4 py-2 rounded-md bg-[#141519] border border-gray-800 text-sm font-semibold hover:border-blue-500 transition"
            >
              ← Sebelumnya
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md bg-[#141519] border border-gray-800 text-sm font-semibold text-gray-600">
              ← Sebelumnya
            </span>
          )}

          <span className="px-4 py-2 rounded-md bg-blue-600 border border-blue-500 text-sm font-semibold text-white">
            {currentPage}
          </span>

          {hasNext ? (
            <Link
              href={pageHref(currentPage + 1)}
              className="px-4 py-2 rounded-md bg-[#141519] border border-gray-800 text-sm font-semibold hover:border-blue-500 transition"
            >
              Berikutnya →
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md bg-[#141519] border border-gray-800 text-sm font-semibold text-gray-600">
              Berikutnya →
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
