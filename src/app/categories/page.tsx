'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, getTags } from '@/lib/admin-queries';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [catsData, tagsData] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(catsData);
      setTags(tagsData);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Kategori & Tags</h1>
            <p className="text-slate-400 mt-2">Kelola genre dan labels konten</p>
          </div>
          <Link
            href="/admin/manage"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold"
          >
            ⚙️ Kelola di Admin
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            🏷️ Kategori ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'tags'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            🔖 Tags ({tags.length})
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-slate-400">⏳ Memuat...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl text-center">
                <p className="text-slate-400">Belum ada kategori</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-lg border border-indigo-500 shadow-lg hover:shadow-indigo-500/50 transition">
                    <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                    <p className="text-indigo-200 text-sm mt-2">slug: {cat.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-slate-400">⏳ Memuat...</div>
              </div>
            ) : tags.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl text-center">
                <p className="text-slate-400">Belum ada tag</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <div key={tag.id} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-purple-500/50 transition hover:scale-105">
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
