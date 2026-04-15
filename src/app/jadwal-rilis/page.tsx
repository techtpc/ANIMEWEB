import Link from 'next/link';

export default function JadwalRilisPage() {
  // Sample data - in production, fetch from database
  const schedule = [
    { day: 'Senin', animes: [{ title: 'Solo Leveling', time: '14:00' }] },
    { day: 'Selasa', animes: [{ title: 'Jujutsu Kaisen', time: '19:00' }] },
    { day: 'Rabu', animes: [{ title: 'One Piece', time: '18:00' }] },
    { day: 'Kamis', animes: [{ title: 'Frieren', time: '20:00' }] },
    { day: 'Jumat', animes: [{ title: 'Ninja Kamui', time: '21:00' }] },
    { day: 'Sabtu', animes: [{ title: 'Wind Breaker', time: '15:00' }] },
    { day: 'Minggu', animes: [{ title: 'The Apothecary Diaries', time: '22:00' }] },
  ];

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      {/* Navbar */}
      <nav className="bg-[#141519] border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-black text-blue-500 italic cursor-pointer">
              SAMEHADAKU<span className="text-white font-normal not-italic">CLONE</span>
            </h1>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/videos" className="hover:text-blue-500 transition-colors">
              Daftar Anime
            </Link>
            <Link href="/jadwal-rilis" className="text-blue-500">
              Jadwal Rilis
            </Link>
            <Link href="/categories" className="hover:text-blue-500 transition-colors">
              Genre
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <span className="w-1 h-8 bg-blue-600"></span>
            Jadwal Rilis Anime
          </h1>
          <p className="text-gray-400">Lihat jadwal episode anime yang akan tayang minggu ini</p>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {schedule.map((entry, idx) => (
            <div
              key={idx}
              className="bg-[#141519] border border-gray-800 rounded-lg p-4 hover:border-blue-600 transition-colors"
            >
              <h3 className="text-blue-500 font-bold mb-4 text-center">{entry.day}</h3>
              <div className="space-y-3">
                {entry.animes.map((anime, animeIdx) => (
                  <div
                    key={animeIdx}
                    className="bg-[#1c1e23] rounded p-3 border border-gray-700 hover:border-indigo-600 hover:bg-indigo-950 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-100">{anime.title}</p>
                    <p className="text-xs text-gray-500 mt-1">⏰ {anime.time}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-800/50 rounded-lg p-6">
          <h3 className="font-bold text-indigo-300 mb-2">💡 Informasi</h3>
          <p className="text-gray-400 text-sm">
            Jadwal rilis menunjukkan waktu episode baru akan tersedia di platform ini. Waktu yang ditampilkan adalah waktu Indonesia (WIB).
          </p>
        </div>
      </div>
    </main>
  );
}
