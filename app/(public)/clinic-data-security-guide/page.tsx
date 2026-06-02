// Path: app/(public)/clinic-data-security-guide/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, Shield, ShieldAlert, Lock, FileWarning, HardDrive, Cloud, Database, CheckCircle2, Flame } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Clinic Data Security Guide — Protect Patient Records Before Disaster Strikes',
  description: 'Fire, flood, theft, or a corrupted Excel file — your clinic\'s patient data is one disaster away from being gone forever. A practical data security guide for Indian clinics.',
  alternates: { canonical: '/clinic-data-security-guide' },
  openGraph: {
    title: 'Clinic Data Security Guide — Protect Patient Records Before Disaster Strikes',
    description: 'What happens if your patient records cabinet catches fire? Or your Excel file gets corrupted? A practical security guide for Indian clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic Data Security Guide' }],
  },
  keywords: ['clinic data security India', 'patient data protection', 'medical records security', 'healthcare data privacy India', 'clinic cybersecurity', 'Digital Personal Data Protection Act clinic', 'patient record safety'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Is my clinic's paper-based patient data covered by India's data protection laws?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Digital Personal Data Protection Act 2023 applies to ALL clinics regardless of whether records are paper or digital. If you collect patient data, you are a "data fiduciary" with legal obligations. Paper records are actually harder to protect and audit than digital ones.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I lose patient records to a fire or flood?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beyond the permanent loss of medical history, you may violate state medical record retention laws (typically 3-10 years). If patients suffer harm due to missing records, you could face legal action. Most clinic insurance policies do NOT cover data recovery from physical records.',
      },
    },
    {
      '@type': 'Question',
      name: 'How secure is cloud storage for medical records?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Modern cloud storage (like what Doxxy uses) is significantly more secure than physical or local-digital storage. Data is AES-256 encrypted (bank-grade), backups are automated and geographically redundant, and access is protected by 2FA. The biggest security threat to clinic data is not cloud hacking — it is unencrypted local files, weak passwords, and paper records with zero access control.',
      },
    },
    {
      '@type': 'Question',
      name: 'What security measures should I look for in clinic software?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Minimum requirements: AES-256 encryption, TLS 1.3 for data in transit, 2FA, role-based access control, full audit logs, automated daily backups, and compliance with DPDP Act and ABDM standards. Doxxy meets all of these. Excel and paper meet none.',
      },
    },
    {
      '@type': 'Question',
      name: 'Our clinic uses Excel on one computer — is that secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. A single Excel file is the most vulnerable form of "digital" record-keeping. It has no encryption, no access control, no audit trail, no automated backup, and one accidental deletion or file corruption destroys everything. A 2024 survey found that 23% of Indian clinics using Excel for records have experienced at least one data loss incident.',
      },
    },
  ],
};

export default function ClinicDataSecurityGuide() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="!py-28 md:!py-40 !max-w-full bg-gray-900 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="destructive" className="mb-6 text-sm px-4 py-1.5">
            60% of Indian clinics have no data backup system. Zero.
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
            If Your Patient Records Cabinet Caught Fire Tonight, Would Your Clinic Survive Tomorrow?
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Paper burns. Computers crash. Excel files corrupt. And India&apos;s new Digital Personal Data Protection Act means you&apos;re legally responsible for patient data — even if it&apos;s on paper. Here&apos;s what you need to know, and what you need to do.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
              <Link href="https://wa.me/+917388890554">Secure Your Clinic Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section>
        <SectionTitle>5 Ways Your Clinic&apos;s Data Could Disappear Tonight.</SectionTitle>
        <SectionSubtitle className="mt-4">
          None of these scenarios are hypothetical. Each one has happened to an Indian clinic in the last 2 years.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4">
              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Fire</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              It&apos;s 2 AM. An electrical short in your clinic. The fire is contained in 20 minutes. But your patient records cabinet — 15 years of medical history, 8,000+ patient files — is ash. There&apos;s no backup. There&apos;s no recovery. Your clinic is legally required to maintain records for 3–10 years (depending on state). You just lost all of them in one night.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
              <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Flood / Water Damage</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Mumbai monsoon. Ceiling leaks overnight. You walk in at 9 AM to find 300 patient files water-damaged beyond legibility. The ink has run. The paper is pulp. Mrs. Sharma&apos;s 5-year diabetes history? Unreadable.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Theft / Burglary</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Someone breaks in. They don&apos;t take the old computer. They don&apos;t take the furniture. They take the cabinet with patient files — an identity theft goldmine. Names, addresses, phone numbers, medical conditions. You now have to call 8,000 patients and tell them their personal data was stolen.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center mb-4">
              <FileWarning className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Excel Corruption</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You&apos;ve been &ldquo;digital&rdquo; for 3 years — an Excel file on the reception computer. Today the file shows: &ldquo;File corrupted. Cannot open.&rdquo; No backup. No cloud copy. 3 years of patient data, billing records, appointment history — gone.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 md:col-span-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Ransomware</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The receptionist clicks a WhatsApp forward link. The clinic computer locks with ransomware: &ldquo;Pay &#x20B9;50,000 in Bitcoin to unlock your files.&rdquo; Your patient database, billing records, appointment calendar — all encrypted and held hostage. Most clinics pay. Half never get their data back.
            </p>
          </div>
        </div>
      </Section>

      {/* THE MATH */}
      <Section className="bg-muted">
        <SectionTitle>What A Data Disaster Costs.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The numbers are brutal. And most clinic insurance policies cover none of this.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Scenario</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Recovery Cost</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Legal Liability</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Reputation Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Fire destroying paper records</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Total loss — unrecoverable</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Violation of medical records retention laws (3–10 years required by state Nursing Home Acts)</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Patients lose trust permanently</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Excel file corruption</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">&#x20B9;15,000–50,000 for data recovery service (no guarantee)</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Patient data loss must be reported under DPDP Act 2023</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Patients notified their data was lost</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Patient data theft</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">&#x20B9;0 direct loss but potential lawsuits</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Fines under DPDP Act + potential patient lawsuits</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Front-page local news: &ldquo;Clinic loses patient data to thieves&rdquo;</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Ransomware</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">&#x20B9;50,000–2,00,000 ransom (no guarantee files are returned)</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Must report breach to authorities</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Patients will switch to a &ldquo;safer&rdquo; clinic</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-center text-lg font-semibold text-red-600 dark:text-red-400 max-w-2xl mx-auto">
          The average cost of a data breach for a small healthcare practice in India: &#x20B9;15–25 Lakhs when you include recovery, legal fees, lost patients, and reputation damage.
        </p>
      </Section>

      {/* THE LAWS */}
      <Section>
        <SectionTitle>You&apos;re Legally Responsible. Whether You Know It Or Not.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Indian law does not care whether your records are paper or digital. If you collect patient data, you are accountable.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Digital Personal Data Protection Act, 2023</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Applies to ALL clinics — paper or digital. You are a &ldquo;data fiduciary.&rdquo; Patients can sue if their data is mishandled. Fines up to &#x20B9;250 crore for large entities, with proportionate penalties for smaller practices. Non-compliance is not an option.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
              <FileWarning className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Nursing Home Act / State Clinical Establishment Acts</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Most states require 3–10 years of medical record retention. If your records are destroyed — by fire, flood, or theft — you are in violation. Destroyed records equal legal non-compliance. Most clinic owners discover this after the disaster.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">ABDM / ABHA Compliance</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Digital health records under the Ayushman Bharat Digital Mission must be interoperable AND secure. ABDM has specific data protection requirements that paper records cannot meet. <Link href="/abdm-compliance-clinic" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">Learn about ABDM compliance</Link>.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Indian Medical Council Regulations</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ethical obligation to maintain patient confidentiality. A data breach is both a legal AND ethical violation. Your registration depends on it. The Medical Council takes patient data protection seriously — and so should you.
            </p>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION */}
      <Section className="bg-muted">
        <SectionTitle>7 Layers of Protection for Your Clinic Data.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Security is not one thing. It is multiple layers. Here is what real protection looks like.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Encrypted Cloud Storage</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              All patient data encrypted at rest (AES-256) and in transit (TLS 1.3). Even if someone hacks the server, the data is unreadable. <Link href="/electronic-medical-records" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">See how digital records work</Link>.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
              <HardDrive className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Automatic Daily Backups</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your data is backed up every day, automatically. Multiple redundant copies across different locations. Fire at your clinic? Data still exists in the cloud. One corrupted file does not mean lost data.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Role-Based Access Control</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Doctor sees everything. Receptionist sees appointments and billing. Lab technician sees only reports. No one sees what they do not need to. Prevents internal data leaks — which is the most common security breach in clinics.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audit Logs</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Every access, every change, every deletion — logged with timestamp and user ID. &ldquo;Who viewed Mrs. Sharma&apos;s records?&rdquo; Answerable in 10 seconds. Required for DPDP Act compliance and internal accountability.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Two-Factor Authentication (2FA)</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Password alone is not enough. Login requires a code from your phone. Even if someone steals your password, they cannot access patient data. The single most effective defence against unauthorized access.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
              <Cloud className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure WhatsApp Communication</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Patient reports and prescriptions sent via WhatsApp are end-to-end encrypted. No patient data sits unencrypted on any device. Patients get what they need, securely — no screenshots, no forwarded PDFs.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 lg:col-span-3">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Offline Mode with Auto-Sync</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Internet down? Clinic runs normally. All data encrypted locally. Auto-syncs to secure cloud when connection returns. No data loss, no security compromise. Built for Indian connectivity conditions where internet reliability varies.
            </p>
          </div>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section>
        <SectionTitle>Patient Data Journey: Paper vs Secure Digital.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Two paths. One keeps data safe. The other is a disaster waiting to happen.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200/75 dark:border-red-800/50 p-8">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
              <FileWarning className="h-6 w-6" /> Paper Workflow
            </h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">1</span>
                Patient writes details on form
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">2</span>
                Form goes into file
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">3</span>
                File goes into unlocked cabinet
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">4</span>
                Anyone in clinic can access
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">5</span>
                No record of who saw it
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">6</span>
                Cabinet could be stolen, burned, flooded
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">7</span>
                Zero backup
              </li>
              <li className="flex items-start gap-3 text-red-700 dark:text-red-400 font-semibold">
                <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">&#10007;</span>
                Gone forever
              </li>
            </ol>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200/75 dark:border-green-800/50 p-8">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6" /> Secure Digital Workflow (Doxxy)
            </h3>
            <ol className="space-y-4">
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">1</span>
                Patient fills digital form (encrypted in transit)
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">2</span>
                Data stored AES-256 encrypted in cloud
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">3</span>
                Access requires 2FA + role permission
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">4</span>
                Every access logged with timestamp + user
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">5</span>
                Daily automated encrypted backups
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">6</span>
                Multiple geographic locations
              </li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 mt-0.5">7</span>
                DPDP Act compliant by design
              </li>
              <li className="flex items-start gap-3 text-green-700 dark:text-green-400 font-semibold">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">&#10003;</span>
                Physical disaster at clinic = zero data loss
              </li>
            </ol>
          </div>
        </div>
      </Section>

      {/* THE RESULTS */}
      <Section className="bg-muted">
        <SectionTitle>What Protected Patient Data Looks Like.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The gap between &ldquo;we manage&rdquo; and actual security is wider than most clinic owners think.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white w-1/3">Aspect</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400 w-1/3">Before (Manual / Excel)</th>
                <th className="p-4 font-semibold text-green-600 dark:text-green-400 w-1/3">After (Doxxy with Security)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Data Storage</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Paper files in unlocked cabinet</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">AES-256 encrypted cloud storage</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Access Control</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Anyone can open any file</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Role-based access, full audit trail</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Backups</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Zero backups</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Automated daily backups, multiple locations</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Disaster Resilience</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Fire / flood = permanent data loss</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Physical disaster = zero data loss</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Accountability</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">No idea who accessed what</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Complete audit logs, DPDP Act compliant</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Form Handling</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Patient forms in a trash bin</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Digital forms, encrypted end-to-end</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Authentication</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Excel password &ldquo;clinic123&rdquo;</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">2FA + enterprise authentication</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            The difference between these two columns is the difference between a clinic that survives a disaster and one that does not.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
              <Link href="/go-paperless-clinic">Go Paperless with Doxxy <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
              <Link href="/what-is-clinic-management-software">What Is Clinic Management Software? <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Answers to the most common clinic data security questions — in plain English, not legalese.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is my clinic&apos;s paper-based patient data covered by India&apos;s data protection laws?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. The Digital Personal Data Protection Act 2023 applies to ALL clinics regardless of whether records are paper or digital. If you collect patient data, you are a &ldquo;data fiduciary&rdquo; with legal obligations. Paper records are actually harder to protect and audit than digital ones — you cannot log who accessed a paper file, you cannot encrypt it, and you cannot back it up. Switching to digital is not just about convenience; it is about meeting your legal obligations.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What happens if I lose patient records to a fire or flood?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Beyond the permanent loss of medical history, you may violate state medical record retention laws (typically 3–10 years). If patients suffer harm due to missing records — for example, a doctor cannot access a drug allergy history — you could face legal action. Most clinic insurance policies do NOT cover data recovery from physical records. The cost is not just financial; it is legal, professional, and personal. <Link href="/clinic-regulatory-compliance-india" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">Read our guide on clinic regulatory compliance</Link>.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How secure is cloud storage for medical records?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Modern cloud storage (like what Doxxy uses) is significantly more secure than physical or local-digital storage. Data is AES-256 encrypted — the same standard used by banks. Backups are automated and geographically redundant. Access is protected by 2FA. The biggest security threat to clinic data is not cloud hacking — it is unencrypted local files, weak passwords, and paper records with zero access control. A locked filing cabinet is not security. It is an illusion of security.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What security measures should I look for in clinic software?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Minimum requirements: AES-256 encryption, TLS 1.3 for data in transit, 2FA, role-based access control, full audit logs, automated daily backups, and compliance with DPDP Act and ABDM standards. Doxxy meets all of these. Excel and paper meet none. If a software vendor cannot clearly answer questions about their encryption standards and data residency, walk away.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our clinic uses Excel on one computer — is that secure?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              No. A single Excel file is the most vulnerable form of &ldquo;digital&rdquo; record-keeping. It has no encryption, no access control, no audit trail, no automated backup, and one accidental deletion or file corruption destroys everything. A 2024 survey found that 23% of Indian clinics using Excel for records have experienced at least one data loss incident. An Excel file on a shared reception computer — possibly with &ldquo;clinic123&rdquo; as the password — is not digital security. It is a liability with a spreadsheet interface.
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
      <Section className="bg-muted text-center">
        <SectionTitle>Don&apos;t Wait for the Fire to Find Out.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every week, an Indian clinic loses patient data permanently — to fire, flood, theft, or a corrupted file. The ones that survive are the ones that had protection in place before the disaster. Be one of them.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">See Pricing Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="What Happens If Your Patient Records Catch Fire?"
        description="Digital records with encrypted backups. No cabinets, no fire risk, no data loss. See how Doxxy keeps your clinic's data safe — chat with us on WhatsApp."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Clinic Data Security Guide', url: `${APP_URL}/clinic-data-security-guide` },
        ]}
      />
    </div>
  );
}
