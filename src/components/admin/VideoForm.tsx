'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCategories,
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // States for embed URLs (Turbovip & Filedon, 480p & 720p)
  const [embeds, setEmbeds] = useState({
    turbovip_480: '',
    turbovip_720: '',
    filedon_480: '',
    filedon_720: '',
  });

  const [downloads, setDownloads] = useState({
    turbovip_480: '',
    turbovip_720: '',
    filedon_480: '',
    filedon_720: '',
  });

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    duration_seconds: initialData?.duration_seconds || 0,
    release_year: initialData?.release_year || new Date().getFullYear(),
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Load embed/download URLs if editing
      if (videoId && initialData) {
        setEmbeds({
          turbovip_480: initialData.embed_url_turbovip_480 || '',
          turbovip_720: initialData.embed_url_turbovip_720 || '',
          filedon_480: initialData.embed_url_filedon_480 || '',
          filedon_720: initialData.embed_url_filedon_720 || '',
        });
        setDownloads({
          turbovip_480: initialData.download_url_turbovip_480 || '',
          turbovip_720: initialData.download_url_turbovip_720 || '',
          filedon_480: initialData.download_url_filedon_480 || '',
          filedon_720: initialData.download_url_filedon_720 || '',
        });
      }

      // Set selected categories from initial data
      if (initialData?.anime_genres) {
        setSelectedCategories(initialData.anime_genres.map((ag: any) => ag.genres.id));
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
9;',./'
  const handleEmbedChange = (server: 'turbovip' | 'filedon', quality: 480 | 720, value: string) => {
    const key = `${server}_${quality}` as keyof typeof embeds;
    setEmbeds(prev => ({ ...prev, [key]: value }));
  };

  const handleDownloadChange = (server: 'turbovip' | 'filedon', quality: 480 | 720, value: string) => {
    const key = `${server}_${quality}` as keyof typeof downloads;
    setDownloads(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEmbeds = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateEmbeds',
          videoId,
          embeds,
          downloads,
        }),
      });

      if (response.ok) {
        alert('✅ Embed & download URLs berhasil disimpan!');
      } else {
        alert('❌ Gagal menyimpan URLs');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      alert('❌ Gagal menyimpan URLs');
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
          const currentGenreIds = currentVideo?.anime_genres?.map((ag: any) => ag.genres.id) || [];

          // Add new genres
          for (const genreId of selectedCategories) {
            if (!currentGenreIds.includes(genreId)) {
              const catResponse = await fetch('/api/admin/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'addGenre',
                  videoId: video.id,
                  genreId,
                }),
              });
              if (!catResponse.ok) console.error('Failed to add genre');
            }
          }

          // Remove old genres
          for (const genreId of currentGenreIds) {
            if (!selectedCategories.includes(genreId)) {
              const catResponse = await fetch('/api/admin/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'removeGenre',
                  videoId: video.id,
                  genreId,
                }),
              });
              if (!catResponse.ok) console.error('Failed to remove genre');
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

          {/* Duration */}
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

        {/* RIGHT COLUMN: Embeds & Downloads */}
        <div className="w-96 flex flex-col gap-3">
          
          {/* Embeds & Downloads Section */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800 pr-4">
            <h3 className="text-sm font-bold text-white uppercase sticky top-0 bg-[#0b0c0f] pb-2">🔗 Embed & Download URLs</h3>

            {/* Turbovip Embeds */}
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">TV</span>
                <span className="text-xs font-bold text-white flex-1">TurboVIP</span>
              </div>
              <input
                type="url"
                value={embeds.turbovip_480}
                onChange={(e) => handleEmbedChange('turbovip', 480, e.target.value)}
                placeholder="Embed URL 480p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={embeds.turbovip_720}
                onChange={(e) => handleEmbedChange('turbovip', 720, e.target.value)}
                placeholder="Embed URL 720p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
            </div>

            {/* Filedon Embeds */}
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">FD</span>
                <span className="text-xs font-bold text-white flex-1">FileDon</span>
              </div>
              <input
                type="url"
                value={embeds.filedon_480}
                onChange={(e) => handleEmbedChange('filedon', 480, e.target.value)}
                placeholder="Embed URL 480p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={embeds.filedon_720}
                onChange={(e) => handleEmbedChange('filedon', 720, e.target.value)}
                placeholder="Embed URL 720p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
            </div>

            {/* Download URLs */}
            <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white">📥 Download URLs</h4>
              
              <div className="text-[10px] text-slate-400 font-semibold">TurboVIP:</div>
              <input
                type="url"
                value={downloads.turbovip_480}
                onChange={(e) => handleDownloadChange('turbovip', 480, e.target.value)}
                placeholder="Download 480p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={downloads.turbovip_720}
                onChange={(e) => handleDownloadChange('turbovip', 720, e.target.value)}
                placeholder="Download 720p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 text-xs"
              />

              <div className="text-[10px] text-slate-400 font-semibold mt-2">FileDon:</div>
              <input
                type="url"
                value={downloads.filedon_480}
                onChange={(e) => handleDownloadChange('filedon', 480, e.target.value)}
                placeholder="Download 480p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
              <input
                type="url"
                value={downloads.filedon_720}
                onChange={(e) => handleDownloadChange('filedon', 720, e.target.value)}
                placeholder="Download 720p..."
                className="w-full px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-400 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveEmbeds}
              disabled={loading || !videoId}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 font-semibold transition text-sm"
            >
              💾 Simpan Embed & Download URLs
            </button>

            {!videoId && (
              <div className="text-xs text-blue-300 bg-blue-900/30 border border-blue-700 p-2 rounded">
                💡 Simpan video terlebih dahulu untuk menambah URLs
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
