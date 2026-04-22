import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import Image from 'next/image';

export default function PublicNavbar() {
  return (
    <nav className="bg-[#141519] border-b border-gray-800 py-2 px-4 md:py-2 md:px-0 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
        <div className="flex items-center w-full md:w-auto justify-start">
          <Link href="/" className="relative block group">
            <div className="relative w-[200px] h-[40px] sm:w-[240px] sm:h-[52px] md:w-[300px] md:h-[70px] lg:w-[320px] lg:h-[80px] transition-transform duration-300 group-hover:scale-105">
           <Image
             src="/logo.png"
             alt="Logo"
             fill
             priority
             className="object-contain object-left"
           />
           </div>
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
