import { supabase } from '@/lib/supabase';
import AnimeCard from '@/components/AnimeCard';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q : '';
  const pageParam = typeof params?.page === 'string' ? Number(params.page) : 1;
  const currentPage = !Number.isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const selectQuery = `
    *,
    anime_genres (
      genres (id, name, slug)
    )
  `;

  let animeList = [];
  let totalItems = 0;

  if (query.trim()) {
    // Search by title or description (case-insensitive)
    const { data, count } = await supabase
      .from('anime')
      .select(selectQuery, { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('title', { ascending: true })
      .range(from, to);

    animeList = data || [];
    totalItems = count || 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pageHref = (page: number) => `/search?q=${encodeURIComponent(query)}&page=${page}`;

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Hasil Pencarian</h1>
            <p className="text-gray-400 mt-2">
              {query ? (
                <>
                  Mencari: <span className="text-blue-400 font-semibold">"{query}"</span>
                  {' '} • Ditemukan: <span className="font-semibold">{totalItems} anime</span>
                  {totalItems > 0 && ` • Halaman ${currentPage} dari ${totalPages}`}
                </>
              ) : (
                'Masukkan kata kunci pencarian'
              )}
            </p>
          </div>
        </div>

        {!query.trim() ? (
          <div className="bg-[#141519] border border-gray-800 p-12 rounded-xl text-center">
            <p className="text-gray-400 text-lg mb-4">Silakan gunakan search box untuk mencari anime</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : animeList.length === 0 ? (
          <div className="bg-[#141519] border border-gray-800 p-12 rounded-xl text-center">
            <p className="text-gray-400 text-lg mb-4">Anime tidak ditemukan untuk "<span className="text-blue-400 font-semibold">{query}</span>"</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {animeList.map((anime: any) => (
                <AnimeCard key={anime.id} video={anime} />
              ))}
            </div>

            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>
    </main>
  );
}
