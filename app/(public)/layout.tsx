// app/(public)/layout.tsx
import { AppHeader } from '@/components/AppHeader'
import SiteFooter from '@/components/SiteFooter'
import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doxxy - Modern Clinic Management Software for Healthcare Providers',
  description: 'Doxxy streamlines clinic operations with smart scheduling, patient records, billing, and telehealth. Reduce admin work by 3+ hours daily. Start free.',
  openGraph: {
    title: 'Doxxy - Modern Clinic Management Software for Healthcare Providers',
    description: 'Streamline clinic operations with smart scheduling, patient records, billing, and telehealth',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy - Clinic Management Software',
      },
    ],
  },
  keywords: ['clinic management software', 'healthcare software', 'medical practice management', 'patient scheduling', 'electronic health records', 'telehealth'],
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PW8LFQ97');
          `,
        }}
      />
      {/* End Google Tag Manager */}

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-PW8LFQ97"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {/* End Google Tag Manager (noscript) */}

      <AppHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}