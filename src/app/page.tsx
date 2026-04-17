import { supabase } from '@/lib/supabase';
import AnimeCard from '@/components/AnimeCard';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';
export default async function HomePage() {
  const selectQuery = `
    *,
    anime_genres (
      genres (id, name, slug)
    )
  `;

  const { data: ongoingAnime } = await supabase
    .from('anime')
    .select(selectQuery)
    .eq('status', 'ongoing')
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: completedAnime } = await supabase
    .from('anime')
    .select(selectQuery)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200 flex flex-col">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6 w-full flex-grow">
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Anime Terbaru Ongoing</h2>
            <Link
              href="/ongoing?page=1"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Lihat semua
            </Link>
          </div>

          {!ongoingAnime || ongoingAnime.length === 0 ? (
            <div className="bg-[#141519] p-8 rounded border border-gray-800 text-center">
              <p className="text-gray-400">Belum ada anime ongoing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ongoingAnime.map((anime: any) => (
                <AnimeCard key={anime.id} video={anime} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Anime Completed</h2>
            <Link
              href="/completed?page=1"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Lihat semua
            </Link>
          </div>

          {!completedAnime || completedAnime.length === 0 ? (
            <div className="bg-[#141519] p-8 rounded border border-gray-800 text-center">
              <p className="text-gray-400">Belum ada anime completed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {completedAnime.map((anime: any) => (
                <AnimeCard key={anime.id} video={anime} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}