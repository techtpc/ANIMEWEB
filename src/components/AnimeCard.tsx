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
  
  return (
    <Link href={href} className="group relative block bg-[#141519] border border-gray-800 rounded overflow-hidden shadow-lg transition-all hover:border-blue-500">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
        />
        {/* Badge Tahun */}
        <div className="absolute top-2 left-2 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded shadow">
          {video.release_year}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-blue-400 transition">
          {video.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
            {genreName}
          </span>
          {durationMinutes !== null ? (
            <span className="text-[10px] text-gray-400">{durationMinutes}m</span>
          ) : (
            <span className="text-[10px] text-gray-400">&nbsp;</span>
          )}
        </div>
      </div>
    </Link>
  );
}