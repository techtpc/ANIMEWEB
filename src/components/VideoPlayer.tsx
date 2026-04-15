export default function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
      <iframe
        src={url}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    </div>
  );
}