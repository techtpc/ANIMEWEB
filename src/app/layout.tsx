// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SAMMEEHADAKU - Nonton Anime Sub Indo",
  description: "Platform streaming anime modern",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9348337344283565" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        {/* Kamu bisa pasang Navbar di sini nanti */}
        {children}
      </body>
       <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''} />

    </html>
  );
}