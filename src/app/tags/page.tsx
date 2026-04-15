'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTags } from '@/lib/admin-queries';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      const data = await getTags();
      setTags(data);
      setLoading(false);
    };

    loadTags();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Tags</h1>
            <p className="text-slate-400 mt-2">Label dan metadata konten • Total: {tags.length} tags</p>
          </div>
          <Link
            href="/admin/manage"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold"
          >
            ⚙️ Kelola di Admin
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">⏳ Memuat...</div>
          </div>
        ) : tags.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl text-center">
            <p className="text-slate-400 mb-4">Belum ada tag</p>
            <Link
              href="/admin/manage"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Buat Tag Pertama
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-full font-semibold shadow-lg hover:shadow-purple-500/50 transition hover:scale-110 cursor-pointer">
                🔖 {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
