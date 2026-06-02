import Script from "next/script";
import dynamic from "next/dynamic";
import HeroRevenue from "@/components/landing/HeroRevenue";
import OutcomeGrid from "@/components/landing/OutcomeGrid";
import ProductShowcase from "@/components/landing/ProductShowcase";
import WhatsAppConnect from "@/components/landing/WhatsAppConnect";
import Testimonials from "@/components/landing/Testimonials";
import TrustAndLegitimacy from "@/components/landing/TrustAndLegitimacy";
import PricingAnchor from "@/components/landing/PricingAnchor";
import StickyBottomCTALoader from "@/components/landing/StickyBottomCTALoader";
import { APP_URL } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const CalculatorROI = dynamic(() => import("@/components/landing/CalculatorROI"), {
  loading: () => <div className="py-20 md:py-28"><Skeleton className="h-96 max-w-3xl mx-auto rounded-2xl" /></div>,
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Doxxy",
  description:
    "Modern clinic management platform for Indian outpatient clinics. Automate bookings, clinical notes, billing, and inventory. ₹10 per consultation.",
  url: APP_URL,
  applicationCategory: "Healthcare Software",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "10",
    priceCurrency: "INR",
    description: "Per consultation",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "500",
    bestRating: "5",
  },
  author: {
    "@type": "Organization",
    name: "Supersite Technologies Private Limited",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressCountry: "IN",
    },
  },
};

export default function LandingPageContent() {
  return (
    <>
      <HeroRevenue />
      <OutcomeGrid />
      <ProductShowcase />
      <CalculatorROI />
      <WhatsAppConnect />
      <Testimonials />
      <TrustAndLegitimacy />
      <PricingAnchor />
      <StickyBottomCTALoader />

      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
