'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EpisodeAnimeForm from '@/components/admin/EpisodeAnimeForm';
import { getVideoDetail } from '@/lib/queries';

export default function EditVideoPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      const data = await getVideoDetail(videoId);
      setVideo(data);
      setLoading(false);
    };

    if (videoId) {
      loadVideo();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-500">Video tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Edit Video</h2>
        <p className="text-gray-600 mt-1">{video.title}</p>
      </div>

      <EpisodeAnimeForm videoId={videoId} initialData={video} />
    </div>
  );
}
