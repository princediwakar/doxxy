import Script from "next/script";
import HeroRevenue from "@/components/landing/HeroRevenue";
import CalculatorROI from "@/components/landing/CalculatorROI";
import OutcomeGrid from "@/components/landing/OutcomeGrid";
import ProductShowcase from "@/components/landing/ProductShowcase";
import Specialties from "@/components/landing/Specialties";
import Testimonials from "@/components/landing/Testimonials";
import FrictionKiller from "@/components/landing/FrictionKiller";
import PricingAnchor from "@/components/landing/PricingAnchor";
import StickyBottomCTA from "@/components/landing/StickyBottomCTA";
import SiteFooter from "@/components/SiteFooter";
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
};

export default function LandingPageContent() {
  return (
    <>
      <HeroRevenue />
      <CalculatorROI />
      <OutcomeGrid />
      <ProductShowcase />
      <Specialties />
      <Testimonials />
      <FrictionKiller />
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
