"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex relative items-center">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari anime..." 
        className="bg-[#1c1e23] border border-gray-700 text-sm text-gray-200 placeholder-gray-500 rounded-l-md px-3 py-1.5 focus:outline-none focus:border-blue-500 w-48 md:w-64 transition-colors"
      />
      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-r-md transition-colors flex items-center justify-center border border-blue-600 hover:border-blue-700"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
