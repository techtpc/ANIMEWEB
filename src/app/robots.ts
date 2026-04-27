import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://animeweb.vercel.app'; // Sesuaikan domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Hindari indexing untuk halaman admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
