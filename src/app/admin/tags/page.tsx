'use client';

import { useEffect, useState } from 'react';
import { getTags, createTag } from '@/lib/admin-queries';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    const data = await getTags();
    setTags(data);
    setLoading(false);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsAdding(true);
    try {
      const newTag = await createTag(newTagName);
      if (newTag) {
        setTags(prev => [...prev, newTag]);
        setNewTagName('');
        alert('Tag berhasil ditambahkan!');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Kelola Tags</h2>
        <p className="text-gray-600 mt-1">Total: {tags.length} tags</p>
      </div>

      {/* Add New Tag Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Tag Baru</h3>
        <form onSubmit={handleAddTag} className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nama tag (contoh: 2024, HD, 12 Episode, dll)"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold transition"
          >
            {isAdding ? 'Menambah...' : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Tags List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : tags.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">Belum ada tag</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map(tag => (
            <div key={tag.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="font-semibold text-gray-800 px-3 py-1 bg-purple-100 text-purple-700 rounded inline-block">
                {tag.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
