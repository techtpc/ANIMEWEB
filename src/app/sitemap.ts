import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Gunakan environment variable atau fallback
  // Di production (Vercel/Netlify), pastikan NEXT_PUBLIC_SITE_URL diset
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://animeweb.vercel.app'; // Ganti dengan domain asli jika sudah ada

  // Route statis yang ada di aplikasi
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/ongoing',
    '/completed',
    '/jadwal-rilis',
    '/search',
    '/categories',
    '/tags',
    '/videos'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Ambil data anime dinamis
    const { data: animes } = await supabase
      .from('anime')
      .select('slug, created_at')
      .order('created_at', { ascending: false });

    const animeRoutes: MetadataRoute.Sitemap = (animes || []).map((anime) => ({
      url: `${baseUrl}/anime/${anime.slug}`,
      lastModified: anime.created_at ? new Date(anime.created_at).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Ambil data video/episode dinamis
    const { data: videos } = await supabase
      .from('videos')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    const videoRoutes: MetadataRoute.Sitemap = (videos || []).map((video) => ({
      url: `${baseUrl}/watch/${video.id}`,
      lastModified: video.created_at ? new Date(video.created_at).toISOString() : new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // Gabungkan semua route
    return [...staticRoutes, ...animeRoutes, ...videoRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
