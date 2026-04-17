'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EpisodeAnimeForm from '@/components/admin/EpisodeAnimeForm';
import { getVideos } from '@/lib/admin-queries';

export default function ManagePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const data = await getVideos();
    setVideos(data);
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus video "${title}"?`)) return;

    const response = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        episodeId: id,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || 'Gagal menghapus');
      return;
    }

    setVideos((prev) => prev.filter((v) => v.id !== id));
    alert('Episode berhasil dihapus');
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
              <p className="text-slate-400 mt-1">Total: {videos.length} video</p>
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Studio</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Kategori</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Links</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tahun</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {videos.map((video, idx) => (
                      <tr key={video.id} className="hover:bg-slate-700 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {video.thumbnail_url && (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium text-white truncate max-w-xs">{video.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {video.studios?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          <div className="flex flex-wrap gap-1">
                            {video.video_categories?.slice(0, 2).map((vc: any, i: number) => (
                              <span key={i} className="px-2 py-1 bg-indigo-600 text-indigo-100 rounded text-xs">
                                {vc.categories?.name}
                              </span>
                            ))}
                            {video.video_categories?.length > 2 && (
                              <span className="px-2 py-1 text-slate-400 text-xs">
                                +{video.video_categories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {video.video_servers?.length || 0} link
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 text-center">
                          {video.release_year}
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
