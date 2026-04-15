'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCategories,
  getVideoServers,
} from '@/lib/admin-queries';

interface VideoFormProps {
  videoId?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function VideoForm({ videoId, initialData, onSuccess }: VideoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [videoServers, setVideoServers] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // States for 2 main streaming platforms
  const [platform1, setPlatform1] = useState({ name: '', url: '' });
  const [platform2, setPlatform2] = useState({ name: '', url: '' });

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    duration_seconds: initialData?.duration_seconds || 0,
    release_year: initialData?.release_year || new Date().getFullYear(),
    download_url: initialData?.download_url || '',
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Load video servers if editing
      if (videoId) {
        const serversData = await getVideoServers(videoId);
        setVideoServers(serversData);
        // Load first 2 platforms
        if (serversData.length > 0) {
          setPlatform1({ name: serversData[0]?.server_name || '', url: serversData[0]?.embed_url || '' });
        }
        if (serversData.length > 1) {
          setPlatform2({ name: serversData[1]?.server_name || '', url: serversData[1]?.embed_url || '' });
        }
      }

      // Set selected categories from initial data
      if (initialData?.video_categories) {
        setSelectedCategories(initialData.video_categories.map((vc: any) => vc.category_id || vc.categories.id));
      }
    };

    loadData();
  }, [videoId, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'duration_seconds' || name === 'release_year') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      alert('❌ Masukkan nama genre!');
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Genre "' + trimmed + '" sudah ada di database!');
      setNewCategoryName('');
      return;
    }
    
    setLoading(true);
    try {
      const slug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      console.log('📝 Creating category:', { name: trimmed, slug });
      
      // Call server-side API route instead of client function
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, slug }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Failed:', result);
        alert('❌ Gagal menambah genre.\nError: ' + (result.error || 'Unknown error') + '\n\nBuka console (F12) untuk detail lengkap.');
        return;
      }

      const newCategory = result.data;
      if (newCategory && newCategory.id) {
        console.log('✅ Success! Category created:', newCategory);
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        alert('✅ Genre "' + trimmed + '" berhasil ditambahkan!');
      } else {
        console.error('❌ Failed: API returned empty data');
        alert('❌ Gagal menambah genre. Buka console (F12) untuk lihat detail error.');
      }
    } catch (err) {
      console.error('❌ Exception in handleAddCategory:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert('⚠️ Error: ' + errMsg + '\n\nBuka console (F12) untuk detail lengkap.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSavePlatform = async (platformNum: 1 | 2) => {
    const platform = platformNum === 1 ? platform1 : platform2;
    if (!platform.name.trim() || !platform.url.trim() || !videoId) return;
    
    setLoading(true);
    try {
      const existingServer = videoServers[platformNum - 1];
      
      if (existingServer) {
        // Remove old server first
        const removeResponse = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'removeServer',
            serverId: existingServer.id,
          }),
        });
        if (!removeResponse.ok) {
          console.error('Failed to remove server');
          return;
        }

        // Add new server
        const addResponse = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addServer',
            videoId,
            platform: { name: platform.name, url: platform.url },
          }),
        });
        
        if (addResponse.ok) {
          const result = await addResponse.json();
          const updated = [...videoServers];
          updated[platformNum - 1] = result.data;
          setVideoServers(updated);
          alert('✅ Platform berhasil disimpan!');
        }
      } else {
        // Add new platform
        const response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addServer',
            videoId,
            platform: { name: platform.name, url: platform.url },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const updated = [...videoServers];
          updated[platformNum - 1] = result.data;
          setVideoServers(updated);
          alert('✅ Platform berhasil ditambahkan!');
        }
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Gagal menyimpan platform');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlatform = async (platformNum: 1 | 2) => {
    if (!confirm(`Hapus platform ${platformNum}?`)) return;
    setLoading(true);
    try {
      const server = videoServers[platformNum - 1];
      if (server) {
        const response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'removeServer',
            serverId: server.id,
          }),
        });

        if (response.ok) {
          const updated = videoServers.filter((_, idx) => idx !== platformNum - 1);
          setVideoServers(updated);
          if (platformNum === 1) setPlatform1({ name: '', url: '' });
          if (platformNum === 2) setPlatform2({ name: '', url: '' });
          alert('✅ Platform berhasil dihapus!');
        }
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Gagal menghapus platform');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('⚠️ Judul harus diisi!');
      return;
    }
    
    if (!formData.thumbnail_url?.trim()) {
      alert('⚠️ Thumbnail URL harus diisi!');
      return;
    }

    setLoading(true);

    try {
      let video;
      
      // Use API route instead of client-side function
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: videoId ? 'update' : 'create',
          videoId,
          videoData: formData,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Failed:', result);
        alert('❌ Gagal menyimpan video.\nError: ' + (result.error || 'Unknown error'));
        return;
      }

      video = result.data;

      if (video) {
        const currentVideo = initialData || video;
        const currentCategoryIds = currentVideo?.video_categories?.map((vc: any) => vc.category_id || vc.categories.id) || [];

        // Add new categories
        for (const categoryId of selectedCategories) {
          if (!currentCategoryIds.includes(categoryId)) {
            const catResponse = await fetch('/api/admin/videos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'addCategory',
                videoId: video.id,
                categoryId,
              }),
            });
            if (!catResponse.ok) console.error('Failed to add category');
          }
        }

        // Remove old categories
        for (const categoryId of currentCategoryIds) {
          if (!selectedCategories.includes(categoryId)) {
            const catResponse = await fetch('/api/admin/videos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'removeCategory',
                videoId: video.id,
                categoryId,
              }),
            });
            if (!catResponse.ok) console.error('Failed to remove category');
          }
        }

        alert(videoId ? 'Video berhasil diperbarui!' : 'Video berhasil ditambahkan!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/manage');
        }
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      alert('⚠️ Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-hidden flex flex-col bg-[#0b0c0f]">
      {/* Main Container: 2 columns */}
      <div className="flex gap-4 flex-1 min-h-0 p-4">
        
        {/* LEFT COLUMN: Input Fields & Genre */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 pr-4">
          
          {/* Title Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Judul</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Solo Leveling Episode 1"
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Tahun</label>
              <input
                type="number"
                name="release_year"
                value={formData.release_year}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Thumbnail Row */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Thumbnail URL <span className="text-red-400">*</span></label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleInputChange}
              placeholder="https://..."
              required
              className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-xs"
            />
            <p className="text-xs text-slate-400 mt-0.5">📸 Link gambar poster/thumbnail</p>
          </div>

          {/* Duration + Download URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Durasi (s)</label>
              <input
                type="number"
                name="duration_seconds"
                value={formData.duration_seconds}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Download URL</label>
              <input
                type="url"
                name="download_url"
                value={formData.download_url}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-xs"
              />
            </div>
          </div>

          {/* Genre Section */}
          <div className="bg-slate-700/50 border border-slate-600 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-white mb-2 uppercase">Genre</h4>
            <div className="grid grid-cols-2 gap-1 mb-2 max-h-20 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-slate-400 text-xs col-span-2">Belum ada genre</p>
              ) : (
                categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 p-1 hover:bg-slate-600 rounded cursor-pointer transition text-xs">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-3 h-3 text-blue-600 border-slate-500 rounded"
                    />
                    <span className="text-slate-200">{category.name}</span>
                  </label>
                ))
              )}
            </div>

            {/* Quick Add Buttons for Existing Genres */}
            {categories.length > 0 && (
              <div className="mb-2 pb-2 border-b border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Klik untuk tambah:</p>
                <div className="flex flex-wrap gap-1">
                  {categories
                    .filter(cat => !selectedCategories.includes(cat.id))
                    .map(category => (
                      <button
                        key={`quick-${category.id}`}
                        type="button"
                        onClick={() => handleCategoryChange(category.id)}
                        className="px-2 py-0.5 bg-slate-600 hover:bg-blue-600 text-slate-200 hover:text-white rounded text-xs transition font-medium border border-slate-500 hover:border-blue-400"
                      >
                        + {category.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Add New Genre Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Genre baru..."
                className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={loading}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-semibold transition text-xs whitespace-nowrap"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Platforms & Submit */}
        <div className="w-96 flex flex-col gap-3">
          
          {/* Platforms Section */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 pr-4">
            <h3 className="text-sm font-bold text-white uppercase sticky top-0 bg-[#0b0c0f] pb-2">🔗 Platform Streaming</h3>

            {/* Platform 1 */}
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">1</span>
                <span className="text-xs font-bold text-white flex-1">Platform Pertama</span>
                {videoServers[0] && <span className="text-xs bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">✓</span>}
              </div>
              <input
                type="text"
                value={platform1.name}
                onChange={(e) => setPlatform1({ ...platform1, name: e.target.value })}
                placeholder="Fildan, Linkboxy..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={platform1.url}
                onChange={(e) => setPlatform1({ ...platform1, url: e.target.value })}
                placeholder="URL embed..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSavePlatform(1)}
                  disabled={loading || !videoId || !platform1.name.trim() || !platform1.url.trim()}
                  className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-semibold transition text-xs"
                >
                  Simpan
                </button>
                {videoServers[0] && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlatform(1)}
                    disabled={loading}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 text-xs"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Platform 2 */}
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">2</span>
                <span className="text-xs font-bold text-white flex-1">Platform Kedua</span>
                {videoServers[1] && <span className="text-xs bg-green-900/50 text-green-300 px-1.5 py-0.5 rounded">✓</span>}
              </div>
              <input
                type="text"
                value={platform2.name}
                onChange={(e) => setPlatform2({ ...platform2, name: e.target.value })}
                placeholder="Fildan, Linkboxy..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={platform2.url}
                onChange={(e) => setPlatform2({ ...platform2, url: e.target.value })}
                placeholder="URL embed..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSavePlatform(2)}
                  disabled={loading || !videoId || !platform2.name.trim() || !platform2.url.trim()}
                  className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 font-semibold transition text-xs"
                >
                  Simpan
                </button>
                {videoServers[1] && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlatform(2)}
                    disabled={loading}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 text-xs"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {!videoId && (
              <div className="text-xs text-blue-300 bg-blue-900/30 border border-blue-700 p-2 rounded">
                💡 Simpan video terlebih dahulu untuk menambah platform
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 border-t border-slate-600 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition text-sm"
            >
              {loading ? '⏳' : (videoId ? '✓ Update' : '✓ Simpan')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition text-sm"
            >
              ✕ Batal
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}
