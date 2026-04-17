import { supabase } from '@/lib/supabase';
import AnimeCard from '@/components/AnimeCard';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default async function CompletedPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const pageParam = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
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
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalItems = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pageHref = (page: number) => `/completed?page=${page}`;

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Completed Anime</h1>
            <p className="text-gray-400 mt-2">
              Total: {totalItems} anime • Halaman {currentPage} dari {totalPages}
            </p>
          </div>
        </div>

        {!animeList || animeList.length === 0 ? (
          <div className="bg-[#141519] border border-gray-800 p-12 rounded-xl text-center">
            <p className="text-gray-400">Belum ada anime completed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {animeList.map((anime: any) => (
              <AnimeCard key={anime.id} video={anime} />
            ))}
          </div>
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
