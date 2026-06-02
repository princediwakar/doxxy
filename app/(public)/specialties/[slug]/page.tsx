// Path: app/(public)/specialties/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SpecialtyTemplate from '@/components/specialties/SpecialtyTemplate';
import { specialtySlugs, getSpecialtyConfig } from '@/config/specialties';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return specialtySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSpecialtyConfig(slug);
  if (!config) return { title: 'Not Found' };

  const title = `${config.heroTitle} — Doxxy`;
  const url = `/specialties/${slug}`;

  return {
    title,
    description: config.heroSubtitle,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: config.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: title }],
    },
    keywords: [config.specialtyName.toLowerCase(), 'clinic software', 'clinic management', `${config.specialtyName.toLowerCase()} EMR`, `clinic management software India`],
  };
}

const SpecialtyPage = async ({ params }: Props) => {
  const { slug } = await params;
  const config = await getSpecialtyConfig(slug);
  if (!config) notFound();

  return <SpecialtyTemplate config={config} />;
};

export default SpecialtyPage;
