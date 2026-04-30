import React from 'react';

export interface ComparisonPoint {
  feature: string;
  doxxy: string;
  competitor: string;
  advantage: string;
  icon: React.ReactNode;
}

export interface PainPoint {
  title: string;
  competitor: string;
  doxxy: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  clinic: string;
  photo: string;
}

export interface FeatureRow {
  feature: string;
  doxxy: boolean | string;
  competitor: boolean | string;
}

export interface MigrationStep {
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ReasonToSwitch {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface WhyChooseItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ComparisonConfig {
  slug: string;
  competitorName: string;
  heroSubtitle: string;
  keyDifferencesSubtitle: string;
  migrationSubtitle: string;
  comparisonPoints: ComparisonPoint[];
  painPointItems: PainPoint[];
  testimonialItems: Testimonial[];
  featureComparisonRows: FeatureRow[];
  migrationSteps: MigrationStep[];
  migrationImageSrc: string;
  coreDifferences?: {
    sectionTitle: string;
    sectionSubtitle: string;
    doxxy: { title: string; subtitle: string; points: string[] };
    competitor: { title: string; subtitle: string; points: string[] };
  };
}

export interface AlternativeConfig {
  slug: string;
  competitorName: string;
  heroSubtitle: string;
  migrationSubtitle: string;
  whyChooseItems: WhyChooseItem[];
  reasonsToSwitch: ReasonToSwitch[];
  testimonialItems: Testimonial[];
  featureComparisonRows: FeatureRow[];
  migrationSteps: MigrationStep[];
  faqs: FAQ[];
}

export const sharedMigrationSteps = (name: string): MigrationStep[] => [
  { title: 'Data Export & Import', description: `We'll help you export your patient data from ${name} and import it into Doxxy.` },
  { title: 'Staff Training', description: 'Comprehensive training for your entire team to ensure a smooth transition.' },
  { title: 'Parallel Operation', description: 'Run both systems side by side during transition to ensure no disruption.' },
  { title: 'Dedicated Support', description: 'Personalized support throughout the migration process.' },
];

export const sharedMigrationImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=500&fit=crop';
