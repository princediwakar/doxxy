import Script from "next/script";
import HeroRevenue from "@/components/landing/HeroRevenue";
import CalculatorROI from "@/components/landing/CalculatorROI";
import OutcomeGrid from "@/components/landing/OutcomeGrid";
import ProductShowcase from "@/components/landing/ProductShowcase";
import WhatsAppConnect from "@/components/landing/WhatsAppConnect";
import Testimonials from "@/components/landing/Testimonials";
import TrustAndLegitimacy from "@/components/landing/TrustAndLegitimacy";
import PricingAnchor from "@/components/landing/PricingAnchor";
import StickyBottomCTA from "@/components/landing/StickyBottomCTA";
import { APP_URL } from "@/lib/constants";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  name: "Doxxy",
  description:
    "Modern clinic management platform for Indian outpatient clinics. Automate bookings, clinical notes, billing, and inventory. ₹10 per appointment.",
  url: APP_URL,
  logo: "/doxxy.png",
  medicalSpecialty: "Healthcare Software",
  parentOrganization: {
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
      <StickyBottomCTA />

      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
