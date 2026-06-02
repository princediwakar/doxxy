// Path: app/(public)/electronic-medical-records/page.tsx

import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Script from 'next/script';
import { ArrowRight, CheckCircle, Search, Shield, Zap, FileText } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Electronic Medical Records Software (EMR) for Indian Clinics — Doxxy',
  description: 'Switch from paper files to digital EMR. Search any patient record in 3 seconds, attach lab reports, share files via WhatsApp. Built for Indian OPD clinics with 5,000+ patient records.',
  alternates: { canonical: '/electronic-medical-records' },
  openGraph: {
    title: 'Electronic Medical Records Software (EMR) for Indian Clinics — Doxxy',
    description: 'Switch from paper files to digital patient records. Search in 3 seconds, never lose a file again.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Electronic Medical Records' }],
  },
  keywords: ['EMR software India', 'electronic medical records for clinics', 'digital patient records India', 'paperless clinic software', 'patient data management India', 'electronic health records clinic'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are digital medical records secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy encrypts all patient data at rest and in transit using bank-grade AES-256 encryption. Our servers are hosted on secure cloud infrastructure with regular security audits. Role-based access controls ensure that only authorized doctors and staff can view sensitive patient information. We comply with Indian healthcare data protection standards and ABDM guidelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I import my existing paper records?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our data migration team helps you digitize existing patient records. For clinics with manageable volumes, you can photograph or scan files and attach them directly to patient profiles. For larger clinics, we offer assisted bulk migration — our team works with your staff to systematically upload patient histories, ensuring a smooth transition from cabinets to cloud.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long are records kept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your patient records remain in Doxxy for as long as you maintain an active account. Even if you cancel, we provide a 30-day window to export all your data in standard formats. Indian Medical Council regulations recommend retaining patient records for at least 3 years from the last consultation — with Doxxy, you can keep them indefinitely without worrying about physical degradation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can patients access their own records?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy lets you share patient records securely via WhatsApp or email directly from the platform. Patients receive a link to view their consultation history, prescriptions, and attached lab reports. You control exactly what is shared — from a single prescription to a complete health timeline. This is especially useful when patients need records for specialist referrals, insurance claims, or personal health tracking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is internet required to access records?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Doxxy is a cloud-based platform, so an active internet connection is required. However, we are designed for Indian connectivity conditions — the interface is lightweight and works reliably even on 4G mobile data. For clinics in areas with unreliable connectivity, we recommend using a mobile hotspot as a backup. Most urban and semi-urban clinics in India already have broadband; if yours does not, we can help you assess connectivity options.',
      },
    },
  ],
};

export default function ElectronicMedicalRecords() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Your Patient Records Should Be at Your Fingertips—Not Buried in a Filing Cabinet.
        </h1>
        <SectionSubtitle>
          Most Indian clinics still run on paper files. Finding one record takes 15 minutes, misfiling is common, and one fire or flood can wipe out years of history. Doxxy EMR makes every record searchable in under 3 seconds.
        </SectionSubtitle>
        <div className="mt-10">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>The Filing Cabinet Is Costing You More Than You Think.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every Indian OPD clinic with over 100 patients a day knows this scene.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            Walk into any established clinic in Mumbai, Delhi, or Bangalore and you will see it: a wall of metal cabinets, each drawer stuffed with thousands of patient files. The average Indian clinic stores <strong className="text-gray-900 dark:text-white">5,000+ paper files</strong>. Every single day, your staff spends precious time pulling folders, searching for misplaced records, and filing them back.
          </p>
          <p className="text-lg leading-relaxed">
            Here is the reality most clinic owners do not calculate: your receptionist or assistant spends roughly <strong className="text-gray-900 dark:text-white">12 to 15 hours every week</strong> on filing and retrieval alone. That is nearly two full working days lost to moving paper. And even with that effort, studies show that <strong className="text-gray-900 dark:text-white">1 in every 20 paper files</strong> gets misfiled — meaning approximately 250 records in a 5,000-file clinic are effectively lost at any given moment.
          </p>
          <p className="text-lg leading-relaxed">
            The cost is not just time. Paper records degrade — ink fades, pages tear, humidity causes mould during monsoons. Critically, they are vulnerable to permanent loss. A fire, a burst pipe, or even rodents can destroy decades of patient history overnight. One clinic owner in Pune lost 12 years of records to a monsoon flood in 2023. His practice had to rebuild from zero.
          </p>
          <p className="text-lg leading-relaxed">
            And when a patient calls asking for their history before a specialist visit? Or you need to check a previous prescription during a busy OPD? The 15-minute search begins. Meanwhile, ten more patients pile up in the waiting room.
          </p>
        </div>
      </Section>

      {/* THE MATH */}
      <Section>
        <SectionTitle>The Numbers Make the Case.</SectionTitle>
        <SectionSubtitle className="mt-4">
          What paper-based record keeping costs your clinic — in time, money, and risk.
        </SectionSubtitle>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">15 min</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Avg. Time to Find Paper File</div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-green-600 dark:text-green-400 text-lg font-bold">3 seconds</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">with Doxxy Digital Search</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">12+ hrs</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Staff Time Lost Weekly</div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-green-600 dark:text-green-400 text-lg font-bold">0 hours</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">automated with Doxxy</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">₹8,000+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Monthly on Paper & Storage</div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-green-600 dark:text-green-400 text-lg font-bold">₹0</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">with digital records</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="text-red-500 dark:text-red-400 text-4xl font-extrabold">100% Risk</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Data Loss from Fire/Flood</div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-green-600 dark:text-green-400 text-lg font-bold">Encrypted Cloud</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">automatic, geo-redundant backup</div>
            </div>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Every Patient, Every Visit, Instantly Available.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Doxxy EMR turns your clinic into a paperless, searchable, and always-available operation.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Search className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Advanced Search</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Find any patient instantly by name, phone number, date of visit, or medical condition. No more flipping through folders. Type &ldquo;Sharma&rdquo; and see every Sharma who ever visited your clinic, with their complete history.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Complete Patient Timeline</h3>
            <p className="text-gray-600 dark:text-gray-300">
              See every consultation, prescription, lab report, and clinical note in a single chronological view. Understand a patient&apos;s health journey in seconds — not by piecing together scattered paper notes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Lab Report Attachments</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload lab reports, X-rays, and scan images directly to a patient&apos;s record. Everything is stored together — no separate filing systems for reports vs prescriptions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Encrypted & Secure</h3>
            <p className="text-gray-600 dark:text-gray-300">
              AES-256 encryption protects every record. Role-based access ensures receptionists see only what they need, while doctors have full access. Data is backed up across multiple locations — no single point of failure.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="18" x="3" y="4" rx="2"/><circle cx="12" cy="10" r="2"/><line x1="8" x2="8" y1="2" y2="4"/><line x1="16" x2="16" y1="2" y2="4"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Share via WhatsApp</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Send prescriptions and test results to patients directly over WhatsApp. No printing, no scanning, no email attachments. Patient gets a link with their records — accessible on any phone.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Migration & Export</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Moving from paper or another software? Our team handles the migration. Need to export data? Download everything in standard formats anytime. Your data is yours — no vendor lock-in.
            </p>
          </div>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section>
        <SectionTitle>How It Works in Your Clinic.</SectionTitle>
        <SectionSubtitle className="mt-4">
          From patient arrival to record saved — the EMR workflow is effortless.
        </SectionSubtitle>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Patient Arrives
              </h4>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Patient walks in or calls. Receptionist enters their name or phone number into the search bar.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                Instant History
              </h4>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete medical history loads in under 3 seconds — past consultations, prescriptions, lab reports, all visible.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                Today&apos;s Consultation
              </h4>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Doctor adds clinical notes, diagnosis, and prescription. All appended to the patient&apos;s timeline automatically.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">&#10003;</div>
                Record Saved
              </h4>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Record auto-saves to the cloud. Ready for the next visit. No filing, no searching, no lost folders.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* BEFORE/AFTER */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Before Doxxy vs After Doxxy.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The difference between paper cabinets and a digital EMR system.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white w-1/3">Aspect</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400 w-1/3">Before Doxxy</th>
                <th className="p-4 font-semibold text-green-600 dark:text-green-400 w-1/3">After Doxxy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Finding Records</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">15 minutes flipping through cabinets. Staff leave OPD counter unattended.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">3 seconds by name, phone, or date. Instant results at the reception desk.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Storage Space</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Entire rooms or walls dedicated to cabinets. Rent wasted on storage, not patient care.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Zero physical space. Everything in the cloud. Use that room for an extra consultation cabin.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Record Completeness</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-green-950/20">Pages missing, illegible handwriting, detached lab reports. Incomplete history.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Every consultation, prescription, and report linked chronologically. Nothing lost.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Sharing with Patients</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Photocopy pages, hand over physical copies. Patient loses them within a week.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Share records via WhatsApp in one click. Patient always has a digital copy.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Disaster Recovery</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Fire, flood, or rodents = permanent loss. 100% unrecoverable.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Encrypted cloud backup across multiple locations. Recoverable in minutes.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Data Portability</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Moving clinics means moving thousands of physical files. Weeks of logistics.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Export all data with one click. Standard formats. Move anywhere, anytime.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Referral Letters</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Manually write referral letter. Pull files for history. 20+ minutes per referral.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Generate referral letter from patient timeline in 2 minutes. Auto-populated history.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Prescription History</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Flip through years of prescriptions to see what was prescribed last time.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Complete prescription timeline visible in one scroll. Drug history, dosages, dates.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Common questions about switching to electronic medical records.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Are digital medical records secure?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. Doxxy encrypts all patient data at rest and in transit using bank-grade AES-256 encryption. Our servers are hosted on secure cloud infrastructure with regular security audits. Role-based access controls ensure that only authorized doctors and staff can view sensitive patient information. We comply with Indian healthcare data protection standards and ABDM guidelines.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can I import my existing paper records?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. Our data migration team helps you digitize existing patient records. For clinics with manageable volumes, you can photograph or scan files and attach them directly to patient profiles. For larger clinics, we offer assisted bulk migration — our team works with your staff to systematically upload patient histories, ensuring a smooth transition from cabinets to cloud.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How long are records kept?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your patient records remain in Doxxy for as long as you maintain an active account. Even if you cancel, we provide a 30-day window to export all your data in standard formats. Indian Medical Council regulations recommend retaining patient records for at least 3 years from the last consultation — with Doxxy, you can keep them indefinitely without worrying about physical degradation.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can patients access their own records?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. Doxxy lets you share patient records securely via WhatsApp or email directly from the platform. Patients receive a link to view their consultation history, prescriptions, and attached lab reports. You control exactly what is shared — from a single prescription to a complete health timeline. This is especially useful when patients need records for specialist referrals, insurance claims, or personal health tracking.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is internet required to access records?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes, Doxxy is a cloud-based platform, so an active internet connection is required. However, we are designed for Indian connectivity conditions — the interface is lightweight and works reliably even on 4G mobile data. For clinics in areas with unreliable connectivity, we recommend using a mobile hotspot as a backup. Most urban and semi-urban clinics in India already have broadband; if yours does not, we can help you assess connectivity options.
            </p>
          </div>
        </div>

        <Script
          id="faq-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Ready to Retire Your Filing Cabinets?</SectionTitle>
        <SectionSubtitle className="mt-4">
          Join thousands of Indian clinics that have switched from paper to Doxxy EMR. Find any record in 3 seconds, never lose patient data, and reclaim your staff&apos;s time for actual patient care.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/digital-prescription-software">Explore Prescriptions <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="Never Ask 'Where's Mrs. Sharma's File?' Again"
        description="Instant patient record search, digital files, zero cabinets. See how EMR works for your clinic on a quick WhatsApp demo."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Electronic Medical Records", url: `${APP_URL}/electronic-medical-records` },
        ]}
      />
    </div>
  );
}
