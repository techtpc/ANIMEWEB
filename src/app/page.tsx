import { supabase } from '@/lib/supabase';
import AnimeCard from '@/components/AnimeCard';
import SearchBox from '@/components/SearchBox';
import Link from 'next/link';
import { Video } from '@/types';

export default async function HomePage() {
  // Ambil data video terbaru
  const { data: latestVideos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  // Ambil data Top 10 minggu ini (berdasarkan views terbanyak - limit 10)
  const { data: weeklyTopVideos } = await supabase
    .from('videos')
    .select('*')
    .order('views', { ascending: false })
    .limit(10);

  const dummyVideos = [
    {
      id: 'dummy-1',
      title: 'Solo Leveling Episode 12 Subtitle Indonesia',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
      duration_seconds: 1440,
      release_year: 2024,
      views: 12500,
    },
    {
      id: 'dummy-2',
      title: 'One Piece Episode 1100 Subtitle Indonesia',
      thumbnail_url: 'https://id.pinterest.com/pin/785948572474830480/',
      duration_seconds: 1500,
      release_year: 1999,
      views: 35000,
    },
    {
      id: 'dummy-3',
      title: 'Jujutsu Kaisen Season 2 Episode 23 Subtitle Indonesia',
      thumbnail_url: 'https://i.ebayimg.com/images/g/HQcAAOSwqwZluMEY/s-l1600.webp',
      duration_seconds: 1400,
      release_year: 2023,
      views: 29000,
    },
    {
      id: 'dummy-4',
      title: 'Ninja Kamui Episode 6 Subtitle Indonesia',
      thumbnail_url: 'https://images.unsplash.com/photo-1542614745-f2ec5b5123d2?w=500&q=80',
      duration_seconds: 1440,
      release_year: 2024,
      views: 15600,
    },
    {
      id: 'dummy-5',
      title: 'Frieren: Beyond Journey\'s End Episode 27 Sub Indo',
      thumbnail_url: 'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=500&q=80',
      duration_seconds: 1440,
      release_year: 2023,
      views: 21000,
    }
  ];

  const displayLatest = latestVideos && latestVideos.length > 0 ? latestVideos : dummyVideos;
  const displayTop10 = weeklyTopVideos && weeklyTopVideos.length > 0 ? weeklyTopVideos : dummyVideos.slice(0, 10);

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200 flex flex-col">
      {/* Navbar Sederhana */}
      <nav className="bg-[#141519] border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center w-full md:w-auto justify-between">
            <h1 className="text-2xl font-black text-blue-500 italic">SAMEHADAKU<span className="text-white font-normal not-italic">CLONE</span></h1>
            {/* Mobile Search Box placeholder maybe? */}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto justify-between">
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/videos" className="hover:text-blue-500 transition-colors">Daftar Anime</Link>
              <Link href="/jadwal-rilis" className="hover:text-blue-500 transition-colors">Jadwal Rilis</Link>
              <Link href="/categories" className="hover:text-blue-500 transition-colors">Genre</Link>
            </div>
            {/* Search Box Component */}
            <SearchBox />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6 w-full flex-grow">
        {/* Section: Top 10 Minggu Ini / Horizontal Scroll */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600"></span> Top 10 Minggu Ini
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800">
            {displayTop10?.map((anime: any, idx: number) => (
              <Link href={`/videos`} key={anime.id}>
                <div className="flex-shrink-0 w-48 group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg aspect-video mb-2">
                    <img src={anime.thumbnail_url} className="object-cover w-full h-full group-hover:scale-110 transition duration-500" alt={anime.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
                      <span className="text-sm font-bold text-blue-400">#{idx + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">{anime.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">👁️ {anime.views?.toLocaleString() || 0} views</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Main Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* KIRI: Grid Anime Terbaru */}
          <section className="flex-1">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600"></span> Update Episode Terbaru
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayLatest?.map((video: any) => (
                <AnimeCard key={video.id} video={video} />
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-[#1c1e23] hover:bg-blue-600 transition rounded-md font-bold text-sm tracking-widest text-white border border-gray-800 hover:border-blue-600">
              LIHAT SEMUA UPDATE
            </button>
          </section>

          {/* KANAN: Sidebar Sederhana */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-[#141519] rounded-md p-4 border border-gray-800">
              <h2 className="font-bold mb-4 text-blue-500 uppercase text-sm tracking-widest border-b border-gray-800 pb-2">
                Genre Terpopuler
              </h2>
              <div className="flex flex-wrap gap-2">
                {['Action', 'ISEKAI', 'Comedy', 'Drama', 'Supernatural', 'Romance', 'Fantasy', 'Sci-Fi', 'School', 'Slice of Life'].map(genre => (
                  <Link key={genre} href="/categories" className="inline-block">
                    <span className="text-xs font-semibold bg-[#1c1e23] border border-gray-800 text-gray-300 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer">
                      {genre}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}