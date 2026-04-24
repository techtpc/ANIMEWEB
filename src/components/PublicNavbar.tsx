'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import Image from 'next/image';

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#141519] border-b border-gray-800 py-2 px-4 md:py-2 md:px-0 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2 md:gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="relative block group">
            <div className="relative w-[200px] h-[80px] sm:w-[340px] sm:h-[104px] md:w-[300px] md:h-[70px] lg:w-[220px] lg:h-[80px] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                priority
                className="object-cover object-left"
                
              />
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links + Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-6 text-sm font-medium">
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-md border border-gray-700 bg-[#1c1e23] hover:border-blue-500 transition-colors"
          aria-label="Toggle Menu"
        >
          <span
            className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-[3px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-[5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[400px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 pb-3">
          <Link
            href="/videos?page=1"
            className="px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1c1e23] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            📺 Anime List
          </Link>
          <Link
            href="/categories"
            className="px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1c1e23] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            🏷️ Genre
          </Link>
          <Link
            href="/jadwal-rilis"
            className="px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1c1e23] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            📅 Jadwal Rilis
          </Link>
          <Link
            href="/ongoing?page=1"
            className="px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1c1e23] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            🔴 On Going Anime
          </Link>
          <div className="px-4 pt-2">
            <SearchBox />
          </div>
        </div>
      </div>
    </nav>
  );
}
