// Path: config/specialties/types.ts

export interface SpecialtyFeature {
  icon: string; // lucide icon name
  title: string;
  description: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
}

export interface BeforeAfter {
  area: string;
  before: string;
  after: string;
}

export interface SpecialtyFAQ {
  question: string;
  answer: string;
}

export interface SpecialtyTestimonial {
  quote: string;
  name: string;
  clinic: string;
  city: string;
  photo: string;
}

export interface SpecialtyConfig {
  slug: string;
  specialtyName: string;
  heroTitle: string;
  heroSubtitle: string;
  problemTitle: string;
  problemDescription: string;
  statsSection: {
    title: string;
    stats: { value: string; label: string }[];
  };
  solutionTitle: string;
  solutionDescription: string;
  keyFeatures: SpecialtyFeature[];
  workflowSteps: WorkflowStep[];
  beforeAfterComparisons: BeforeAfter[];
  testimonial?: SpecialtyTestimonial;
  faqs: SpecialtyFAQ[];
}
