// Path: config/cities/types.ts

export interface CityTestimonial {
  quote: string
  name: string
  clinic: string
  photo: string
}

export interface CityFAQ {
  question: string
  answer: string
}

export interface CityFeature {
  icon: string
  title: string
  description: string
}

export interface CityConfig {
  slug: string
  cityName: string
  state: string
  heroTitle: string
  heroSubtitle: string
  problemTitle: string
  problemDescription: string
  clinicStats: {
    estimatedClinics: string
    avgPatientsPerDay: string
    softwareAdoptionRate: string
    abdmComplianceRate: string
    paperUsageRate: string
    specialtyMix: string
  }
  clinicEconomics: {
    avgRevenuePerPatient: string
    avgMonthlyRevenue: string
    avgNoShowRate: string
    estimatedMonthlyLossToNoShows: string
    avgBillingErrorRate: string
  }
  techContext: {
    whatsappPenetration: string
    digitalPaymentAdoption: string
    internetPenetration: string
  }
  regulatoryNotes: string
  solutionTitle: string
  solutionDescription: string
  keyFeatures: CityFeature[]
  whyDoxxyInThisCity: string
  testimonials: CityTestimonial[]
  faqs: CityFAQ[]
}
