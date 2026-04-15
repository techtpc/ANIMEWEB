'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🎬</span>
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-indigo-100 text-sm">Manajemen Konten Anime Streaming</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-800 border-r border-slate-700 shadow-xl">
          <nav className="p-6 space-y-3">
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg transition duration-200 font-medium"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/manage"
              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200 font-semibold shadow-lg"
            >
              <span className="text-xl">⚙️</span>
              <span>Kelola Konten</span>
            </Link>
            <div className="h-px bg-slate-700 my-2"></div>
            <Link
              href="/videos"
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition duration-200 font-medium"
            >
              <span className="text-xl">🎥</span>
              <span>Daftar Video</span>
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition duration-200 font-medium"
            >
              <span className="text-xl">🏷️</span>
              <span>Kategori</span>
            </Link>
            <Link
              href="/tags"
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition duration-200 font-medium"
            >
              <span className="text-xl">🔖</span>
              <span>Tags</span>
            </Link>
            <div className="h-px bg-slate-700 my-2"></div>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition duration-200 font-medium"
            >
              <span className="text-xl">🏠</span>
              <span>Kembali ke Home</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
