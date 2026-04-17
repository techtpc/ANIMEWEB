'use client';

import EpisodeAnimeForm from '@/components/admin/EpisodeAnimeForm';

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tambah Video Baru</h2>
        <p className="text-gray-600 mt-1">Buat entri video baru dengan informasi lengkap</p>
      </div>

      <EpisodeAnimeForm />
    </div>
  );
}
