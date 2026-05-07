'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EpisodeAnimeForm from '@/components/admin/EpisodeAnimeForm';
import { getVideos } from '@/lib/admin-queries';

const PAGE_SIZE = 20;

export default function ManagePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

  useEffect(() => {
    loadVideos();
  }, [page]);

  const loadVideos = async () => {
    setLoading(true);
    const result = await getVideos(page, PAGE_SIZE);
    setVideos(result.data);
    setTotalCount(result.count);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus video "${title}"?`)) return;

    const response = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        videoId: id,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || 'Gagal menghapus');
      return;
    }

    // Refresh current page
    if (videos.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      loadVideos();
    }
    alert('Video berhasil dihapus');
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setActiveTab('form');
  };

  const handleFormClose = () => {
    setEditingVideo(null);
    setActiveTab('list');
    loadVideos();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'list'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          📋 Daftar Video
        </button>
        <button
          onClick={() => {
            setEditingVideo(null);
            setActiveTab('form');
          }}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'form'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          ➕ {editingVideo ? 'Edit' : 'Tambah'} Video
        </button>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Kelola Video</h2>
              <p className="text-slate-400 mt-1">Total: {totalCount} video</p>
            </div>
            <button
              onClick={() => {
                setEditingVideo(null);
                setActiveTab('form');
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center gap-2"
            >
              <span>➕</span> Tambah Video Baru
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-slate-400 text-lg">⏳ Memuat...</div>
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 p-12 rounded-xl shadow-lg text-center">
              <p className="text-slate-400 text-lg mb-4">Belum ada video</p>
              <button
                onClick={() => setActiveTab('form')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Buat Video Pertama
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700 border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Judul</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Anime</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Episode</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tahun</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {videos.map((video, idx) => (
                      <tr key={video.id} className="hover:bg-slate-700 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {(video.thumbnail_url || video.anime?.thumbnail_url) && (
                              <img 
                                src={video.thumbnail_url || video.anime?.thumbnail_url}
                                alt={video.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium text-white truncate max-w-xs">{video.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {video.anime?.title || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {video.embed_url_turbovip_480 || video.embed_url_turbovip_720 ? (
                              <span className="px-2 py-0.5 bg-blue-600 text-blue-100 rounded text-[10px] font-bold">
                                Turbovip
                              </span>
                            ) : null}
                            {video.embed_url_filedon_480 || video.embed_url_filedon_720 ? (
                              <span className="px-2 py-0.5 bg-purple-600 text-purple-100 rounded text-[10px] font-bold">
                                Filedon
                              </span>
                            ) : null}
                            {!video.embed_url_turbovip_480 && !video.embed_url_turbovip_720 && !video.embed_url_filedon_480 && !video.embed_url_filedon_720 ? (
                              <span className="px-2 py-0.5 bg-red-600 text-red-100 rounded text-[10px] font-bold">
                                No Server
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 text-center">
                          {video.release_year || video.anime?.release_year || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(video)}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition font-semibold"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(video.id, video.title)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition font-semibold"
                            >
                              🗑️ Hapus
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
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Halaman {page} dari {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
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
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'border-slate-600 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-slate-600 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                    >
                      Berikutnya →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Tab */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {editingVideo ? `Edit: ${editingVideo.title}` : 'Tambah Video Baru'}
            </h2>
            <p className="text-slate-400 mt-1">
              {editingVideo ? 'Perbarui informasi video dan link streaming' : 'Buat entry video baru dengan semua informasi lengkap'}
            </p>
          </div>

          <EpisodeAnimeForm 
            videoId={editingVideo?.id} 
            initialData={editingVideo}
            onSuccess={handleFormClose}
          />
        </div>
      )}
    </div>
  );
}
