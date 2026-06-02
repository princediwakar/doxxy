// Path: app/(public)/cities/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CityHubTemplate from '@/components/cities/CityHubTemplate'
import { citySlugs, getCityConfig } from '@/config/cities'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return citySlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const config = await getCityConfig(slug)
  if (!config) return { title: 'Not Found' }

  const title = `Clinic Management Software in ${config.cityName} — Doxxy`
  const description = `Doxxy helps clinics in ${config.cityName} go digital — WhatsApp reminders, paperless records, UPI billing, and ABDM compliance. Serving ${config.clinicStats.estimatedClinics} clinics across ${config.cityName}.`
  const url = `/cities/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: title }],
    },
    keywords: [
      `clinic management software ${config.cityName.toLowerCase()}`,
      `clinic software ${config.cityName.toLowerCase()}`,
      `doctor software ${config.cityName.toLowerCase()}`,
      `${config.cityName.toLowerCase()} clinic software`,
      `EMR software ${config.cityName.toLowerCase()}`,
      `clinic management software India`,
      'ABDM compliant clinic software',
      'WhatsApp clinic reminders',
    ],
  }
}

const CityHubPage = async ({ params }: Props) => {
  const { slug } = await params
  const config = await getCityConfig(slug)
  if (!config) notFound()

  return <CityHubTemplate config={config} />
}

export default CityHubPage
