'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideos, deleteVideo } from '@/lib/admin-queries';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const data = await getVideos();
      setVideos(data);
      setLoading(false);
    };

    loadVideos();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus video "${title}"?`)) return;

    const success = await deleteVideo(id);
    if (success) {
      setVideos(prev => prev.filter(v => v.id !== id));
      alert('Video berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Video</h2>
          <p className="text-gray-600 mt-1">Total: {videos.length} video</p>
        </div>
        <Link 
          href="/admin/videos/new"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Tambah Video Baru
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">Belum ada video. Mulai dengan membuat video baru!</p>
          <Link 
            href="/admin/videos/new"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Buat Video Pertama
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Judul</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Studio</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tags</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tahun</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {videos.map(video => (
                  <tr key={video.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {video.thumbnail_url && (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-xs">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {video.studios?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {video.video_categories?.slice(0, 2).map((vc: any, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {vc.categories?.name}
                          </span>
                        ))}
                        {video.video_categories?.length > 2 && (
                          <span className="px-2 py-1 text-gray-600 text-xs">
                            +{video.video_categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {video.video_tags?.slice(0, 2).map((vt: any, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {vt.tags?.name}
                          </span>
                        ))}
                        {video.video_tags?.length > 2 && (
                          <span className="px-2 py-1 text-gray-600 text-xs">
                            +{video.video_tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {video.release_year}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link 
                          href={`/admin/videos/${video.id}/edit`}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(video.id, video.title)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
