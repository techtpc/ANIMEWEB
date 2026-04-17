import Link from 'next/link';
import SearchBox from '@/components/SearchBox';

export default function PublicNavbar() {
  return (
    <nav className="bg-[#141519] border-b border-gray-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto justify-between">
          <Link href="/" className="text-2xl font-black text-blue-500 italic">
            SAMEHADAKU<span className="text-white font-normal not-italic">CLONE</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto justify-between">
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/videos?page=1" className="hover:text-blue-500 transition-colors">
              Anime List
            </Link>
            <Link href="/categories" className="hover:text-blue-500 transition-colors">
              Genre
            </Link>
            <Link href="/jadwal-rilis" className="hover:text-blue-500 transition-colors">
              Jadwal Rilis
            </Link>
            <Link href="/ongoing?page=1" className="hover:text-blue-500 transition-colors">
              On Going Anime
            </Link>
          </div>
          <SearchBox />
        </div>
      </div>
    </nav>
  );
}
