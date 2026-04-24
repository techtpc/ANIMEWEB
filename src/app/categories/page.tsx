'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import { getCategories } from '@/lib/admin-queries';

export default function CategoriesPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const catsData = await getCategories();
      setGenres(catsData);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-gray-200">
      <PublicNavbar />
      <div className="max-w-6xl mx-auto space-y-6 p-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Genre</h1>
          <p className="text-slate-400 mt-2">Pilih genre untuk melihat daftar anime</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">⏳ Memuat...</div>
          </div>
        ) : genres.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl text-center">
            <p className="text-slate-400">Belum ada genre</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/categories/${g.slug}`}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-lg border border-indigo-500 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-lg font-bold text-white">{g.name}</h3>
                <p className="text-indigo-200 text-sm mt-2">Lihat anime →</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
