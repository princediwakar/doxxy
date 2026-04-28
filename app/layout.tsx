// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'
import { AppHeader } from '@/components/AppHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://doxxy.neurovisionhospital.com"),
  title: 'Doxxy - Clinic Management',
  description: 'Modern clinic management software for healthcare providers',
  verification: { google: '6XTorYQy4TdZB9Z3EF6fNyU4BcWaTma53piGhXir-Tc' },
  openGraph: {
    title: 'Doxxy - Clinic Management',
    description: 'Modern clinic management software for healthcare providers',
    type: 'website',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy - Modern Clinic Management Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mydoxxy',
    images: [
      {
        url: '/doxxy.png',
        alt: 'Doxxy - Modern Clinic Management Software',
      },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>

        {/* Tawk.to Script (commented out for now) */}
        {/* <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/686051366a55a6191184c914/1ius3qfbc';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        /> */}
      </body>
    </html>
  )
}