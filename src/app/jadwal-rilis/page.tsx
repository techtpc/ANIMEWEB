import { supabase } from '@/lib/supabase';
import PublicNavbar from '@/components/PublicNavbar';
import Link from 'next/link';

export default async function JadwalRilisPage() {
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const { data: ongoingAnime } = await supabase
    .from('anime')
    .select('id, title, slug, thumbnail_url, day_of_week')
    .eq('status', 'ongoing')
    .order('title', { ascending: true });

  const schedule = dayNames.map((day, idx) => ({
    day,
    animes: (ongoingAnime || []).filter((anime: any) => anime.day_of_week === idx),
  }));

  const totalScheduled = (ongoingAnime || []).length;

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <span className="w-1 h-8 bg-blue-600"></span>
            Jadwal Rilis Anime
          </h1>
          <p className="text-gray-400">
            Menampilkan anime ongoing berdasarkan hari rilis dari database. Total anime ongoing: {totalScheduled}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {schedule.map((entry) => (
            <div
              key={entry.day}
              className="bg-[#141519] border border-gray-800 rounded-lg p-4 hover:border-blue-600 transition-colors"
            >
              <h3 className="text-blue-500 font-bold mb-4 text-center">{entry.day}</h3>
              <div className="space-y-3">
                {entry.animes.length === 0 ? (
                  <div className="bg-[#1c1e23] rounded p-3 border border-gray-700">
                    <p className="text-xs text-gray-500 text-center">Tidak ada jadwal</p>
                  </div>
                ) : (
                  entry.animes.map((anime: any) => (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.slug || anime.id}`}
                      className="block bg-[#1c1e23] rounded p-3 border border-gray-700 hover:border-indigo-600 hover:bg-indigo-950 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-100">{anime.title}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-800/50 rounded-lg p-6">
          <h3 className="font-bold text-indigo-300 mb-2">Informasi</h3>
          <p className="text-gray-400 text-sm">
            Data jadwal diambil dari kolom <code className="bg-gray-900 px-2 py-1 rounded">day_of_week</code> pada tabel
            anime untuk status <code className="bg-gray-900 px-2 py-1 rounded">ongoing</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
