'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideos, deleteVideo } from '@/lib/admin-queries';

const PAGE_SIZE = 20;

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const result = await getVideos(page, PAGE_SIZE);
      setVideos(result.data);
      setTotalCount(result.count);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    loadVideos();
  }, [page]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus video "${title}"?`)) return;

    const success = await deleteVideo(id);
    if (success) {
      // If we deleted the last item on the page and it's not page 1, go back a page
      if (videos.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        const result = await getVideos(page, PAGE_SIZE);
        setVideos(result.data);
        setTotalCount(result.count);
        setTotalPages(result.totalPages);
      }
      alert('Video berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Video</h2>
          <p className="text-gray-600 mt-1">Total: {totalCount} video</p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Anime</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Episode</th>
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
                      {video.anime?.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {video.episode_number || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {video.embed_url_turbovip_480 || video.embed_url_turbovip_720 ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                            Turbovip
                          </span>
                        ) : null}
                        {video.embed_url_filedon_480 || video.embed_url_filedon_720 ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">
                            Filedon
                          </span>
                        ) : null}
                        {!video.embed_url_turbovip_480 && !video.embed_url_turbovip_720 && !video.embed_url_filedon_480 && !video.embed_url_filedon_720 ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                            No Server
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {video.release_year || video.anime?.release_year || '-'}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Sebelumnya
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 border rounded ${
                        page === pageNum 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
