// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'
import { APP_URL, SOCIAL_LINKS } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Doxxy - Clinic Management',
  description: 'Modern clinic management software for healthcare providers',
  manifest: '/manifest.json',
  verification: { google: '6XTorYQy4TdZB9Z3EF6fNyU4BcWaTma53piGhXir-Tc' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Doxxy',
  },
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
  maximumScale: 5.0,
  themeColor: '#1f8fff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          id="site-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${APP_URL}/#organization`,
                  name: "Doxxy",
                  url: APP_URL,
                  logo: `${APP_URL}/doxxy.png`,
                  description:
                    "Modern clinic management software for healthcare providers — smart scheduling, patient records, billing, and telehealth.",
                  sameAs: SOCIAL_LINKS,
                },
                {
                  "@type": "WebSite",
                  "@id": `${APP_URL}/#website`,
                  name: "Doxxy",
                  url: APP_URL,
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${APP_URL}/help?search={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        {/* Must run before any other scripts — FB SDK checks for this when it loads */}
        <Script
          id="fb-async-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.fbAsyncInit=function(){window.FB&&window.FB.init({appId:"${process.env.NEXT_PUBLIC_META_APP_ID || "4330186140630040"}",autoLogAppEvents:!0,xfbml:!0,version:"v25.0"})}`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>

        {/* Register Service Worker for PWA — production only */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="register-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      reg.addEventListener('updatefound', function() {
                        var newWorker = reg.installing;
                        if (!newWorker) return;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            window.dispatchEvent(new Event('sw-update'));
                          }
                        });
                      });
                    }).catch(function(err) {
                      console.error('SW registration failed:', err);
                    });
                  });
                }
              `,
            }}
          />
        )}

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