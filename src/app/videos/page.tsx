'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideos } from '@/lib/admin-queries';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(false);
      const data = await getVideos();
      setVideos(data);
      setLoading(false);
    };

    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Daftar Video</h1>
            <p className="text-slate-400 mt-2">Total: {videos.length} video</p>
          </div>
          <Link
            href="/admin/manage"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold"
          >
            ➕ Kelola di Admin
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">⏳ Memuat...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl text-center">
            <p className="text-slate-400">Belum ada video</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map(video => (
              <div key={video.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition group">
                {video.thumbnail_url && (
                  <div className="aspect-video overflow-hidden bg-slate-700">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{video.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{video.release_year}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {video.video_servers?.length || 0} link | {video.video_categories?.length || 0} kategori
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
