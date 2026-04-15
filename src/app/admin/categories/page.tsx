'use client';

import { useEffect, useState } from 'react';
import { getCategories, createCategory } from '@/lib/admin-queries';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      const newCategory = await createCategory(newCategoryName, slug);
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        alert('Kategori berhasil ditambahkan!');
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Kelola Kategori</h2>
        <p className="text-gray-600 mt-1">Total: {categories.length} kategori</p>
      </div>

      {/* Add New Category Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tambah Kategori Baru</h3>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nama kategori (contoh: Action, Romance, dll)"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
          >
            {isAdding ? 'Menambah...' : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div key={category.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Slug: {category.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
