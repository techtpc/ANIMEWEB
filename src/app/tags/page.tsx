'use client';

import Link from 'next/link';

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Tags</h1>
          <p className="text-slate-400 mt-2">
            Di versi v2 ini, fitur tags sudah tidak dipakai. Filter sekarang menggunakan <span className="text-slate-200 font-semibold">genres</span>.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl text-center">
          <p className="text-slate-400 mb-4">Lihat daftar genre untuk memfilter anime.</p>
          <Link
            href="/categories"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Buka Halaman Genre
          </Link>
        </div>
      </div>
    </div>
  );
}
