'use client';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-slate-300 text-lg">Selamat datang di panel manajemen konten</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
          <div className="text-5xl font-bold mb-2">📊</div>
          <h3 className="text-sm font-semibold text-indigo-100">Total Video</h3>
          <p className="text-3xl font-bold mt-2">-</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
          <div className="text-5xl font-bold mb-2">🏷️</div>
          <h3 className="text-sm font-semibold text-purple-100">Kategori</h3>
          <p className="text-3xl font-bold mt-2">-</p>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-xl shadow-lg text-white">
          <div className="text-5xl font-bold mb-2">🔖</div>
          <h3 className="text-sm font-semibold text-pink-100">Tags</h3>
          <p className="text-3xl font-bold mt-2">-</p>
        </div>
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-6 rounded-xl shadow-lg text-white">
          <div className="text-5xl font-bold mb-2">🎬</div>
          <h3 className="text-sm font-semibold text-rose-100">Studio</h3>
          <p className="text-3xl font-bold mt-2">-</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/manage" className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition text-white group">
            <div className="text-4xl mb-3">⚙️</div>
            <h4 className="font-semibold text-lg group-hover:text-indigo-100">Kelola Konten</h4>
            <p className="text-sm text-indigo-200 mt-1">Tambah/edit video dengan embedded link</p>
          </a>
          <a href="/videos" className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition text-white group">
            <div className="text-4xl mb-3">🎥</div>
            <h4 className="font-semibold text-lg group-hover:text-purple-100">Daftar Video</h4>
            <p className="text-sm text-purple-200 mt-1">Lihat semua video yang sudah dibuat</p>
          </a>
          <a href="/categories" className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg hover:from-pink-600 hover:to-pink-700 transition text-white group">
            <div className="text-4xl mb-3">🏷️</div>
            <h4 className="font-semibold text-lg group-hover:text-pink-100">Kategori & Tags</h4>
            <p className="text-sm text-pink-200 mt-1">Kelola kategori dan tags konten</p>
          </a>
        </div>
      </div>
    </div>
  );
}
