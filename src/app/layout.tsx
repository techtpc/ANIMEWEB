// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'

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
      <body className={inter.className}>
        {/* Kamu bisa pasang Navbar di sini nanti */}
        {children}
      </body>
       <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''} />

    </html>
  );
}