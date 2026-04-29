import Link from 'next/link';

export default function AnimeCard({ video }: { video: any }) {
  // Compat: bisa menerima data episode (`videos`) atau data anime (`anime`)
  const href = video?.slug
    ? `/anime/${video.slug}`
    : video?.anime_id
      ? `/anime/${video.anime_id}`
      : `/anime/${video?.id}`;

  const genreName =
    video?.anime_genres?.[0]?.genres?.name ||
    video?.video_categories?.[0]?.categories?.name ||
    'Anime';

  const durationMinutes =
    typeof video?.duration_seconds === 'number' ? Math.floor(video.duration_seconds / 60) : null;
    
  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const dayName = video?.day_of_week !== undefined && video?.day_of_week !== null
    ? dayNames[video.day_of_week]
    : null;

  let episodeText = null;
  if (video?.episode_number) {
    episodeText = `Eps ${video.episode_number}`;
  } else if (video?.videos && Array.isArray(video.videos) && video.videos.length > 0) {
    const maxEps = Math.max(...video.videos.map((v: any) => v.episode_number || 0));
    episodeText = `Eps ${maxEps}`;
  } else if (video?.total_episodes) {
    episodeText = `Eps ${video.total_episodes}`;
  }
  
  return (
    <Link href={href} className="group relative block bg-[#141519] border border-gray-800 rounded overflow-hidden shadow-lg transition-all hover:border-blue-500 hover:shadow-xl">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
        />
        {/* Badges: Tahun & Hari */}
        <div className="absolute top-1 left-1 flex gap-1">
          {video.release_year && (
            <div className="bg-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
              {video.release_year}
            </div>
          )}
          {dayName && (
            <div className="bg-purple-600 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
              {dayName}
            </div>
          )}
        </div>

        {/* Badge Episode Terbaru */}
        {episodeText && (
          <div className="absolute top-1 right-1 bg-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
            {episodeText}
          </div>
        )}
      </div>
      
      <div className="p-2">
        <h3 className="text-[10px] font-bold leading-tight line-clamp-2 group-hover:text-blue-400 transition">
          {video.title}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-1">
          <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tighter line-clamp-1">
            {genreName}
          </span>
          {durationMinutes !== null ? (
            <span className="text-[8px] text-gray-400 whitespace-nowrap">{durationMinutes}m</span>
          ) : (
            <span className="text-[8px] text-gray-400">&nbsp;</span>
          )}
        </div>
      </div>
    </Link>
  );
}