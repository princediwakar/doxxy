// Path: app/(public)/free-clinic-software-india/page.tsx

import { Button } from "@/components/ui/button";
import Script from "next/script";
import { Check, X, ArrowRight, ExternalLink, Shield, AlertTriangle, BadgeIndianRupee, Clock, Users, Zap } from "lucide-react";
import Link from "next/link";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Clinic Software India 2026 — What\'s Actually Free (Honest Guide)',
  description: 'Honest guide to free clinic management software in India. Compare e-Sushrut, OpenMRS, Practo Ray, and Doxxy\'s 100 free consultations. No bait-and-switch.',
  alternates: { canonical: '/free-clinic-software-india' },
  openGraph: {
    title: 'Free Clinic Software India 2026 — What\'s Actually Free (Honest Guide)',
    description: 'Honest guide to free clinic management software in India. Compare e-Sushrut, OpenMRS, Practo Ray, and Doxxy\'s 100 free consultations. No bait-and-switch.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Free Clinic Software India Guide' }],
  },
  keywords: ['free clinic management software India', 'free EMR for doctors', 'free clinic software', 'free electronic medical records software India', 'clinic software free trial'],
};

// --- DATA ---

interface FreeOption {
  name: string;
  letter: string;
  color: string;
  whatIsFree: string;
  catch: string;
  bestFor: string;
  verdict: string;
  verdictType: 'honest' | 'mostly' | 'not-free';
}

const freeOptions: FreeOption[] = [
  {
    name: 'e-Sushrut (C-DAC)',
    letter: 'E',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    whatIsFree: 'Completely free. Developed by C-DAC, funded by the Government of India. No licensing fees, no per-patient charges.',
    catch: 'Built for government hospitals. Limited to specific workflows — OPD registration, basic IPD, lab. No WhatsApp integration. No mobile app. UI looks like it was built in 2005. No private clinic features like billing or prescription templates.',
    bestFor: 'Government hospitals and large charitable institutions with dedicated IT staff who can manage the deployment.',
    verdict: 'Honest — genuinely free, but not built for private clinics.',
    verdictType: 'honest',
  },
  {
    name: 'OpenMRS',
    letter: 'O',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    whatIsFree: 'Open source. Free to download and use. Strong global community. Highly customizable for developers.',
    catch: 'Requires IT staff to set up, host, and maintain. No billing module out of the box. No Indian clinic workflows (no ABDM, no INR billing, no Indian prescription formats). Hosting costs ₹500–₹1,000/month minimum. Every customization needs a developer.',
    bestFor: 'NGO hospitals and research institutions that have an IT team on payroll and need custom workflows.',
    verdict: 'Honest — free software, but not free to run.',
    verdictType: 'mostly',
  },
  {
    name: 'Google Sheets + WhatsApp',
    letter: 'G',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    whatIsFree: 'Actually free. Zero cost. Every clinic already has a phone with WhatsApp. Google Sheets is free with a Google account.',
    catch: 'Zero structure. No patient record security — anyone with access can see everything. No ABDM compliance. No audit trail. Works until you hit ~200 patients, then searching becomes impossible. No prescription templates. No billing integration. If your phone is lost, patient chat history is gone.',
    bestFor: 'Single-doctor clinics seeing fewer than 5 patients a day. Homeopathy or alternative medicine practitioners with minimal documentation needs.',
    verdict: 'Honest — it is free, but not clinic software.',
    verdictType: 'honest',
  },
  {
    name: 'Practo Ray (Free Tier)',
    letter: 'P',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    whatIsFree: 'Limited free tier. Basic appointment scheduling and patient records for up to 50 appointments a month.',
    catch: '50 appointments/month is too low for any real clinic. No prescription templates on the free tier. No WhatsApp reminders. Data locked into Practo ecosystem — hard to export. Upgrade costs are significant and per-doctor. You are listed on Practo\'s patient marketplace (you are the product).',
    bestFor: 'Clinics that want to test software before buying — but be aware of the data lock-in.',
    verdict: 'Not Really Free — free tier exists, but it is a lead funnel for paid plans.',
    verdictType: 'not-free',
  },
  {
    name: 'Doxxy Practice Essentials',
    letter: 'D',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    whatIsFree: 'First 100 consultations free. Forever. No time limit. Full features included — EMR, digital prescriptions, billing, WhatsApp reminders. Unlimited doctors and staff. No credit card required.',
    catch: 'After 100 consultations, it is ₹10 per consultation. If your clinic sees 30+ patients a day, your free consultations run out in 3–4 days. Cloud-based — needs internet. Built for Indian clinics, not suitable if you are outside India.',
    bestFor: 'Small to medium Indian clinics (1–5 doctors) wanting to start digital without upfront cost. New practices testing the waters.',
    verdict: 'Honest — most generous free tier among commercial options.',
    verdictType: 'honest',
  },
];

const catchPatterns = [
  {
    icon: Clock,
    title: 'Time-Limited Trials Disguised as Free Plans',
    description: 'Many "free plans" are 14-day or 30-day trials. After that, you pay full price or lose access to your data. A free trial is not a free plan — it is a sales demo.',
  },
  {
    icon: X,
    title: 'Feature Crippling',
    description: 'The free tier gives you appointment booking but not prescriptions. Or patient records but not billing. You get just enough to see the product, not enough to run a clinic. You will need the paid plan within a week.',
  },
  {
    icon: Users,
    title: 'Patient Limits Too Low to Be Useful',
    description: '50 appointments a month. 100 patients total. These limits are designed so any real clinic outgrows the free tier in days. It is not a free plan — it is a demo with a "free" label.',
  },
  {
    icon: Shield,
    title: 'Data Lock-In',
    description: 'Free to start, expensive to leave. Your patient records, appointment history, and billing data are stored in a proprietary format. Exporting is either impossible, incomplete, or costs money. You are not paying with rupees — you are paying with your freedom to leave.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Hidden Per-Doctor Fees After Month 1',
    description: 'Free for one doctor. Add a second doctor? That will be ₹500/month. Add a receptionist login? Another ₹300. The base price is free; the actual price of running a multi-doctor clinic is anything but.',
  },
  {
    icon: AlertTriangle,
    title: 'You Are the Product',
    description: 'Some "free" platforms make money by listing your clinic on a patient marketplace. Your clinic name, location, and availability become searchable. Patients book through their platform — and they take a commission. The software is free because they are selling your patients to other doctors.',
  },
];

const comparisonRows = [
  { dimension: 'Really Free?', doxxy: 'Yes — 100 consultations, no time limit', others: 'Usually a time-limited trial (14–30 days)' },
  { dimension: 'Full Features on Free Plan?', doxxy: 'Yes — EMR, prescriptions, billing, WhatsApp', others: 'No — free tier is usually crippled' },
  { dimension: 'Doctor/Staff Limits', doxxy: 'Unlimited on all plans', others: 'Per-doctor fees; free tier limited to 1–2 users' },
  { dimension: 'Credit Card Required?', doxxy: 'No', others: 'Often yes, "for verification"' },
  { dimension: 'After Free Limit?', doxxy: '₹10/consultation, no-shows free', others: 'Jump to ₹500–₹2,000/month per doctor' },
  { dimension: 'Data Export?', doxxy: 'Full export anytime, standard formats', others: 'Difficult or incomplete export; data lock-in' },
  { dimension: 'Hidden Fees?', doxxy: 'None. No setup, no training, no support fees', others: 'Setup fees, training fees, SMS charges, support fees' },
];

const faqs = [
  {
    question: 'Is there really a completely free clinic management software in India?',
    answer: 'Yes and no. e-Sushrut by C-DAC is genuinely free (government-funded), but it is built for government hospitals — not private clinics. OpenMRS is free open-source software, but you will pay for hosting (₹500–₹1,000/month) and need IT staff to maintain it. For private clinics wanting zero upfront cost, Doxxy\'s Practice Essentials gives you 100 free consultations with full features and no time limit. After that, it is ₹10 per consultation. There is no completely free, full-featured, ready-to-use clinic software for private clinics in India — anyone claiming otherwise is hiding a catch.',
  },
  {
    question: 'What\'s the best free clinic software for a small clinic?',
    answer: 'It depends on what "small" means. If you see fewer than 5 patients a day as a solo doctor, Google Sheets + WhatsApp works — but you will have no security, no prescription templates, and no way to search patient history efficiently. If you see 5–15 patients a day, a free plan like Doxxy Practice Essentials (100 free consultations, full features) is the best fit among commercial options. If you see 20+ patients a day, no free plan will last you more than a week — you should evaluate paid plans based on per-consultation pricing rather than chasing "free."',
  },
  {
    question: 'Does Doxxy really give 100 consultations free?',
    answer: 'Yes. The first 100 consultations on Doxxy Practice Essentials are completely free. No time limit — you can use them over 3 months or 3 years. No credit card required. Full features included: EMR, digital prescriptions, billing, WhatsApp reminders. No hidden per-doctor fees. This is not a trial; it is a genuine free tier. The business model works because clinics that grow past 100 consultations typically stay and pay ₹10 per consultation.',
  },
  {
    question: 'What happens after I use up my 100 free consultations?',
    answer: 'Your account continues without interruption. Consultations 101 onwards are billed at ₹10 per consultation. If a patient does not show up, you are not charged for that consultation. There is no subscription, no annual contract, and no per-doctor fees. You only pay for consultations that actually happen. You can stop using Doxxy anytime and export all your data.',
  },
  {
    question: 'Can I export my data if I start with free and want to leave?',
    answer: 'Yes. Doxxy allows full data export in standard formats at any time — whether you are on the free plan or paid. Your patient records, appointment history, prescriptions, and billing data are yours. We do not lock you in. This is a critical question to ask any software vendor before signing up. Many "free" plans make exporting difficult or incomplete specifically to prevent you from leaving.',
  },
  {
    question: 'Why would Doxxy give away free appointments? What\'s the catch?',
    answer: 'The catch is honest math, not a hidden trap. Most clinics that try Doxxy and see 100 patients through the platform find it indispensable and continue as paying customers at ₹10 per consultation. The free consultations are our customer acquisition cost — instead of spending money on Google ads and sales teams, we invest it in letting you actually use the product. If your clinic is too small to ever cross 100 consultations, you get a genuinely free clinic management tool. If your clinic grows, we earn your business. That is the entire model.',
  },
];

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const verdictColors: Record<FreeOption['verdictType'], { bg: string; text: string; label: string }> = {
  honest: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', label: 'Honest' },
  mostly: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', label: 'Mostly Honest' },
  'not-free': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: 'Not Really Free' },
};

const verdictIcon = (type: FreeOption['verdictType']) => {
  if (type === 'honest') return <Check className="h-4 w-4 text-green-600 dark:text-green-400" />;
  if (type === 'mostly') return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  return <X className="h-4 w-4 text-red-600 dark:text-red-400" />;
};

export default function FreeClinicSoftwareIndia() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Free Clinic Software in India &mdash; What&apos;s Actually Free and What&apos;s Not.
        </h1>
        <SectionSubtitle>
          An honest guide. No bait-and-switch. We&apos;ll even tell you about options that aren&apos;t Doxxy.
        </SectionSubtitle>
        <div className="mt-10">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free (No Catch) <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE HONEST LANDSCAPE */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Every &ldquo;Free&rdquo; Clinic Software Option in India, Ranked by What You Actually Get.</SectionTitle>
        <SectionSubtitle className="mt-4">
          We tested them, read the fine print, and talked to clinics using them. Here is the unvarnished truth about each one &mdash; including Doxxy.
        </SectionSubtitle>

        <div className="mt-16 space-y-6 max-w-5xl mx-auto">
          {freeOptions.map((option) => {
            const verdictStyle = verdictColors[option.verdictType];
            return (
              <div key={option.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Logo placeholder */}
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${option.color}`}>
                      {option.letter}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{option.name}</h3>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${verdictStyle.bg} ${verdictStyle.text}`}>
                        {verdictIcon(option.verdictType)}
                        <span>{verdictStyle.label}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">What&apos;s Actually Free</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{option.whatIsFree}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">The Catch</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{option.catch}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-1">Who It&apos;s Best For</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{option.bestFor}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">{option.verdict}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* THE CATCH SECTION */}
      <Section>
        <SectionTitle>What &ldquo;Free&rdquo; Usually Means in Clinic Software.</SectionTitle>
        <SectionSubtitle className="mt-4">
          After reviewing dozens of &ldquo;free&rdquo; clinic software offerings in India, we found the same patterns repeating. Here is what to watch for.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto">
          {catchPatterns.map((pattern) => (
            <div key={pattern.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center mb-4">
                <pattern.icon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{pattern.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{pattern.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY DOXXY'S FREE PLAN IS DIFFERENT */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Why Doxxy&apos;s Free Plan Is Different.</SectionTitle>
        <SectionSubtitle className="mt-4">
          First 100 Consultations Free. Forever. No Asterisks.
        </SectionSubtitle>

        {/* Differentiators grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Time Limit</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Not 14 days. Not 30 days. Use your 100 free consultations over 3 months or 3 years. The clock does not tick.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Full Features Included</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real digital prescriptions. Real patient records. Real billing. No crippled &ldquo;demo mode.&rdquo; The free plan is the actual product.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Unlimited Doctors &amp; Staff</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No per-seat pricing. Ever. Add every doctor, receptionist, and pharmacist in your clinic at zero extra cost.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BadgeIndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Credit Card Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Sign up, create your clinic, and start seeing patients. We do not ask for payment details until you cross 100 consultations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No-Shows Don&apos;t Count</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              After 100 consultations, you pay only for consultations that happen. Patient did not show up? You are not charged for that slot.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Simple Upgrade Path</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              After 100 consultations: &#x20B9;10 per consultation. No jump to a massive subscription. No per-doctor surge. Just pay for what you use.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Doxxy Free vs &ldquo;Other Free Plans&rdquo;
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-700/50">
              <div className="p-4 font-semibold text-gray-900 dark:text-white">Dimension</div>
              <div className="p-4 font-semibold text-sky-600 dark:text-sky-400">Doxxy Free</div>
              <div className="p-4 font-semibold text-gray-500 dark:text-gray-400">Other &ldquo;Free&rdquo; Plans</div>
            </div>
            {comparisonRows.map((row, index) => (
              <div
                key={row.dimension}
                className={`grid grid-cols-3 ${
                  index < comparisonRows.length - 1
                    ? 'border-b border-gray-200/75 dark:border-gray-700/50'
                    : ''
                }`}
              >
                <div className="p-4 text-sm font-medium text-gray-800 dark:text-gray-200">{row.dimension}</div>
                <div className="p-4 text-sm text-gray-700 dark:text-gray-300 bg-sky-50/50 dark:bg-sky-950/10">
                  <Check className="h-3.5 w-3.5 text-sky-500 inline mr-1.5" />
                  {row.doxxy}
                </div>
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  <X className="h-3.5 w-3.5 text-red-400 inline mr-1.5" />
                  {row.others}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHO SHOULDN'T USE DOXXY */}
      <Section>
        <SectionTitle>Who Shouldn&apos;t Use Doxxy (Yes, Really).</SectionTitle>
        <SectionSubtitle className="mt-4">
          Doxxy is not for everyone. If any of these describe you, there are better options. We would rather you find the right tool than force-fit ours.
        </SectionSubtitle>

        <div className="mt-16 max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                You&apos;re a single-doctor clinic seeing 3 patients a day.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                If your patient volume is very low and your documentation needs are minimal, Google Sheets + WhatsApp might actually be fine. A full EMR adds overhead you may not need. Doxxy becomes worth it when you have enough patients that searching through sheets becomes frustrating, or when you need digital prescriptions that look professional.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                You run a government hospital with an IT team.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                If you have a dedicated IT department and need highly customized workflows, OpenMRS or e-Sushrut might be better choices. They are designed for institutional deployment. Doxxy is built for private clinics that want software to work out of the box without needing a technical team.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                You need completely offline software.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Doxxy is cloud-based and requires an internet connection. It works fine on 4G mobile data, but if your clinic is in an area with zero connectivity, Doxxy will not work. Look for desktop-based software that stores data locally if internet access is unreliable or absent.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your clinic is not in India.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Doxxy is purpose-built for Indian clinics. The billing is in INR, prescriptions follow Indian formats, ABDM compliance is India-specific, and the entire interface assumes Indian clinical workflows. If you practice in Bangladesh, Sri Lanka, or Nepal, some features may still apply, but Doxxy is not optimized for non-Indian healthcare systems.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl mx-auto">
            If you read this section and thought &ldquo;none of these apply to me,&rdquo; then Doxxy is likely a good fit.
            <Link href="https://wa.me/+917388890554" className="text-blue-600 dark:text-blue-400 font-medium ml-1 hover:underline">Try it free &rarr;</Link>
          </p>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Honest answers to the questions Indian clinic owners actually ask about free software.
        </SectionSubtitle>

        <div className="mt-16 max-w-3xl mx-auto space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center">
        <SectionTitle>Try Doxxy Free. Or Don&apos;t. At Least Now You Know Your Options.</SectionTitle>
        <SectionSubtitle className="mt-4">
          We wrote this guide because clinic owners deserve honesty, not marketing. If Doxxy fits your clinic, start with 100 free consultations. If another option fits better, use it. The important thing is that you stop running your clinic on paper and WhatsApp alone.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">See Full Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="Start Free. Upgrade When You're Ready."
        description="No credit card. No time limit on the free plan. When your practice outgrows it, paid plans start at ₹999/mo. Chat with us on WhatsApp to get set up."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Free Clinic Software India', url: `${APP_URL}/free-clinic-software-india` },
        ]}
      />

      <Script
        id="free-clinic-software-faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
