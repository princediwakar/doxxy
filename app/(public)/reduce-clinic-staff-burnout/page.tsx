// Path: app/(public)/reduce-clinic-staff-burnout/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, Users, Clock, FileText, Heart, TrendingDown, Smile, CheckCircle2, Zap } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Reduce Clinic Staff Burnout — Automation Saves 3+ Hours of Paperwork Daily',
  description: 'Indian clinic receptionists spend 70% of their day on paperwork that software eliminates. Reduce burnout, retain your best staff, and let your team focus on patients — not files.',
  alternates: { canonical: '/reduce-clinic-staff-burnout' },
  openGraph: {
    title: 'Reduce Clinic Staff Burnout Through Automation — Save 3+ Hours Daily',
    description: 'Receptionists spend 3+ hours daily on paperwork. Automation eliminates the busywork and brings back the human touch. Real data from Indian clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Reduce Clinic Staff Burnout' }],
  },
  keywords: ['reduce clinic staff burnout', 'clinic admin automation', 'reduce receptionist workload', 'healthcare staff burnout India', 'clinic workflow automation', 'medical practice efficiency'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many hours does clinic software actually save staff per day?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy clinics report saving 3+ hours of staff time daily. Patient registration goes from 5 minutes to 30 seconds per patient. Billing becomes automatic — the bill generates directly from the doctor\'s consultation record. Appointment reminders become automated WhatsApp messages instead of 60 minutes of manual phone calls each evening. End-of-day cash reconciliation goes from 30 minutes of tallying to one click on a dashboard. Across registration, billing, reminders, and reconciliation, the typical clinic saves 15-20 hours of receptionist time per week.',
      },
    },
    {
      '@type': 'Question',
      name: 'My receptionist has no computer experience. Will they be able to use clinic software?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is designed for non-technical users. If your receptionist can use WhatsApp, they can use Doxxy. The interface is intentionally simple — large buttons, clear labels in English and Hindi, minimal menus. Most receptionists are comfortable and confident within 2-3 days. We see this consistently across clinics: staff who had never touched a computer before are managing the full patient queue, generating bills, and sending WhatsApp reminders by the end of their first week. The learning curve is measured in days, not weeks. And our support team is available on WhatsApp and phone to help your staff through the first few days.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does automation reduce staff burnout specifically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Burnout comes from three things: repetitive meaningless tasks, constant interruptions, and having no tools to actually solve problems. Automation eliminates the repetition (data entry, billing math, reminder calls), reduces interruptions (patients can self-check queue status on WhatsApp instead of asking the receptionist every 5 minutes), and gives staff tools that actually work (instant record search, auto-reconciled payments, digital queue management). The result is that staff spend their day on human interaction — greeting patients, helping elderly visitors, coordinating smooth patient flow — instead of being buried in paperwork. The job transforms from data-entry clerk to patient experience coordinator. That transformation is what prevents burnout.',
      },
    },
    {
      '@type': 'Question',
      name: "What's the ROI of reducing staff turnover?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Replacing a receptionist costs ₹25,000-35,000 when you account for hiring (job postings, interview time), training (2-3 weeks of shadowing before they are productive), and lost productivity (the replacement makes mistakes, is slower, does not yet know the patients). If automation extends average receptionist tenure from 12 months to 36 months, you save roughly ₹50,000-70,000 in turnover costs per staff member over 3 years. On top of that, you recover ₹1,35,000-2,40,000 per year in paperwork labor that is now automated — meaning your staff spend their time on patient care and revenue-generating activities. The combined ROI of reduced turnover plus recovered productive time typically exceeds ₹5,00,000 over 3 years for a single receptionist.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will automation make my staff lazy or redundant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Automation removes busywork so staff can do what humans do best: greet patients warmly, handle special situations, provide comfort to anxious patients, and ensure the clinic runs smoothly. In manual clinics, receptionists are so buried in data entry and paperwork that they barely have time to look up and smile at a patient. In digital clinics, the software handles the repetitive tasks, freeing the receptionist to be the warm, capable face of your clinic. Receptionists in Doxxy clinics consistently report higher job satisfaction — not because they are doing less, but because what they do matters more. They shift from being data-entry clerks to being patient experience coordinators. That is not redundancy. That is elevation.',
      },
    },
  ],
};

const HeroSection = () => (
  <Section className="bg-gray-900 dark:bg-gray-950 !py-28 md:!py-40">
    <div className="text-center">
      <div className="flex justify-center mb-8">
        <Badge variant="secondary" className="text-sm px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
          44% of Indian healthcare staff report burnout symptoms — and paperwork is the #1 cause
        </Badge>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
        Your Best Receptionist Just Quit. She Didn&apos;t Leave For More Money. She Left Because Her Job Was 80% Paperwork.
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Indian clinic staff spend 3+ hours daily on manual paperwork — filing, calling patients, tallying bills, searching for lost records. This isn&apos;t their job. It&apos;s what their job became because the clinic never automated.
      </p>
      <div className="mt-10">
        <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
          <Link href="https://wa.me/+917388890554">See How Automation Works <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>A Day In Your Receptionist&apos;s Life (It&apos;s Worse Than You Think).</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not fiction. This is the daily reality of thousands of clinic receptionists across India. Read it. Then ask yourself how long you would last in this job.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-0">
      {[
        { time: '8:30 AM', text: 'Arrive. Stack of yesterday\'s files to refile. 25 minutes.', highlight: false },
        { time: '9:00 AM', text: 'First patients arrive. Register each one manually — name, age, phone, address, medical history on paper. 5 minutes per patient. 20 patients = 100 minutes of pure handwriting.', highlight: true },
        { time: '10:40 AM', text: 'Patients asking "kitna time lagega?" every 5 minutes. Constantly interrupted. Can\'t finish a single task without being pulled away.', highlight: false },
        { time: '11:30 AM', text: 'Doctor needs Mrs. Gupta\'s file from 2019. Search through 3 cabinets. 12 minutes. Found it crumpled at the bottom. Doctor is irritated.', highlight: true },
        { time: '12:00 PM', text: 'Billing. Manual addition of consultation + tests + medicines. Patient argues about the amount. 5 minutes of explanation while the queue grows.', highlight: false },
        { time: '1:30 PM', text: 'Lunch? 10 minutes at the desk between patients. Cold chai. No real break.', highlight: true },
        { time: '3:00 PM', text: 'A patient calls to reschedule. Find the physical register, cross out old time, write new time. Hope you don\'t double-book. 5 minutes.', highlight: false },
        { time: '4:30 PM', text: 'Call tomorrow\'s patients for reminders. 30 patients x 2 minutes each = 60 minutes of dialling. Half don\'t answer. Your voice is gone.', highlight: true },
        { time: '6:00 PM', text: 'End of day. Tally cash, count against register entries. 30 minutes of mental math. ₹200 short. Search for the error. Exhausted. Just want to go home.', highlight: false },
        { time: '7:00 PM', text: 'Leave. Did all of this for ₹12,000/month. Has been looking for another job for 3 weeks.', highlight: true },
      ].map(({ time, text, highlight }) => (
        <div key={time} className="flex gap-6 border-l-2 border-muted-foreground/20 pl-6 pb-8 last:pb-0 relative">
          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${highlight ? 'bg-red-500 border-red-500' : 'bg-muted border-muted-foreground/30'}`} />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{time}</div>
            <p className={`leading-relaxed ${highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{text}</p>
          </div>
        </div>
      ))}
      <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-800 dark:text-red-200 font-semibold text-lg leading-relaxed">
          This isn&apos;t a bad employee. This is an impossible job description disguised as &quot;receptionist.&quot;
        </p>
      </div>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-muted">
    <SectionTitle>What Staff Burnout Costs Your Clinic.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every number here is based on real Indian clinic economics. The cost of doing nothing is higher than you think.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Cost</th>
            <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { cost: 'Receptionist salary (avg Indian clinic)', amount: '₹12,000-18,000/month' },
            { cost: 'Cost of replacing a receptionist (hiring, training, lost productivity)', amount: '₹25,000-35,000' },
            { cost: 'Average receptionist tenure in manual clinics', amount: '8-14 months' },
            { cost: 'Hours spent on paperwork daily', amount: '3-4 hours (worth ₹150-200/hr)' },
            { cost: 'Paperwork labor cost (annual)', amount: '₹1,35,000-2,40,000' },
            { cost: 'Revenue lost during staff transition (2-4 weeks without experienced receptionist)', amount: '₹30,000-60,000' },
            { cost: "Doctor's time spent on admin (prescriptions, records, billing review)", amount: '1-1.5 hours/day' },
          ].map(({ cost, amount }) => (
            <tr key={cost} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 text-gray-700 dark:text-gray-300">{cost}</td>
              <td className="p-4 font-semibold text-gray-900 dark:text-white">{amount}</td>
            </tr>
          ))}
          <tr className="bg-red-50 dark:bg-red-900/20">
            <td className="p-4 font-bold text-red-800 dark:text-red-200">Total annual cost of manual processes</td>
            <td className="p-4 font-bold text-red-800 dark:text-red-200">₹2-4 Lakhs per clinic</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-6 text-center text-muted-foreground text-sm">
        Plus the invisible cost: doctors doing admin instead of seeing patients. Every hour a doctor spends on paperwork is an hour they are not generating revenue. <Link href="/pricing" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">See what automation costs vs. what it saves</Link>.
      </p>
    </div>
  </Section>
);

const WhySection = () => (
  <Section>
    <SectionTitle>Why Your Staff Burn Out. (It&apos;s Not the Pay.)</SectionTitle>
    <SectionSubtitle className="mt-4">
      Clinic owners often assume staff leave for more money. They usually don&apos;t. They leave because the job is broken. Here are the five reasons.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {[
        {
          icon: FileText,
          title: 'Repetitive Manual Tasks',
          description: 'Writing the same patient details 30 times a day. Every day. For years. Name, age, phone, address, symptoms — the same fields, the same pens, the same registers. The human brain was not designed for this kind of repetitive clerical work. It erodes motivation, attention, and eventually, the will to show up.',
        },
        {
          icon: Users,
          title: 'Constant Interruptions',
          description: '"Mera number aa gaya?" every 3 minutes. "Doctor kitni der mein aayenge?" every 5 minutes. The receptionist cannot focus on any single task for more than 2 minutes. This kind of task-switching is cognitively exhausting — research shows it reduces effective productivity by up to 40%. By noon, your receptionist is mentally fried.',
        },
        {
          icon: TrendingDown,
          title: 'Blame for System Failures',
          description: 'File is lost? Receptionist\'s fault. Billing error? Receptionist\'s mistake. Patient waited too long? Receptionist should have managed the queue better. But it is not the person — it is the system. Manual processes are inherently error-prone. No human can track 200 patient files, 50 daily bills, and 30 reminder calls without something slipping through. When the system fails, the receptionist takes the blame.',
        },
        {
          icon: Smile,
          title: 'Zero Growth. Zero Pride.',
          description: 'The job is the same on day 1 and day 500. No new skills learned. No career progression. Nothing to put on a resume except "managed patient register." No one grows up wanting to be a data-entry clerk. Without growth or pride in their work, staff disengage. They do the minimum. Then they leave.',
        },
        {
          icon: Heart,
          title: 'Emotional Labour With No Tools',
          description: 'Dealing with frustrated patients — long waits, billing disputes, lost files — while having no tools to actually solve their problems. The receptionist absorbs patient anger all day but cannot fix the root causes because they are systemic. This is emotional labour without the resources to manage it. It leads to compassion fatigue, cynicism, and eventually, resignation.',
        },
      ].map(({ icon: Icon, title, description }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section className="bg-muted">
    <SectionTitle>Automate the Busywork. Bring Back the Human Touch.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every one of these solutions replaces hours of manual labour with software. Your staff stop being clerks and start being caregivers.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          icon: FileText,
          title: 'Digital Patient Registration',
          description: 'Patient fills a form ONCE. The data lives in the EMR forever. No re-writing. On subsequent visits, the patient checks in via QR code — the receptionist sees their full history instantly. Receptionist goes from data-entry clerk to patient-care coordinator. Time saved: 80 minutes per day on manual registration alone.',
          links: [
            { href: '/digital-patient-registration', text: 'See how digital registration works' },
          ],
        },
        {
          icon: Zap,
          title: 'Automated Billing & Payments',
          description: 'Doctor records the consultation → bill auto-generates with all line items. UPI QR appears on screen → patient scans and pays → payment auto-reconciles against the bill. Receptionist never does manual addition, never hunts for a ₹200 mismatch at end of day, never explains a bill they did not prepare. Time saved: 45 minutes of billing and 30 minutes of reconciliation daily.',
          links: [
            { href: '/clinic-billing-software', text: 'Explore automated billing' },
            { href: '/clinic-payment-collection-guide', text: 'How UPI collections work' },
          ],
        },
        {
          icon: Clock,
          title: 'Automated Appointment Reminders',
          description: 'No more calling 30 patients every evening. Doxxy sends WhatsApp reminders automatically — 24 hours before the appointment, with the doctor name, time, and clinic address. Patients confirm with one tap. The receptionist\'s 60-minute daily calling task becomes zero minutes. Cancelled slots are auto-offered to waitlisted patients. Time saved: 60 minutes of phone calls daily.',
          links: [
            { href: '/whatsapp-appointment-reminders', text: 'See how WhatsApp reminders work' },
          ],
        },
        {
          icon: Users,
          title: 'Instant Record Retrieval',
          description: 'Search by patient name, phone number, or ABHA ID. Results appear in 1 second. Complete history — past visits, prescriptions, lab reports, bills — all on one screen. Never search through cabinets again. Never hear the doctor say "file kahan hai?" again. Time saved: 15-25 minutes of file searching daily, plus the goodwill of not irritating your doctor.',
          links: [
            { href: '/electronic-medical-records', text: 'See the EMR in action' },
          ],
        },
      ].map(({ icon: Icon, title, description, links }) => (
        <div key={title} className="flex gap-6 items-start bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {links.map((l: { href: string; text: string }) => (
                <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
                  {l.text} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section>
    <SectionTitle>Your Receptionist&apos;s Day: Before and After Automation.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Same clinic. Same patients. Completely different work experience. This is what happens when software does the paperwork.
    </SectionSubtitle>
    <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-2 gap-8">
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 p-8">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Before Automation (Manual Clinic)
        </h3>
        <div className="space-y-4">
          {[
            { time: '8:30-9:00', task: 'File yesterday\'s records', duration: '25 min' },
            { time: '9:00-11:00', task: 'Manual patient registration', duration: '100 min' },
            { time: '11:00-1:00', task: 'Handle queries + billing (interrupted constantly)', duration: '120 min' },
            { time: '1:00-1:30', task: 'Lunch (if lucky)', duration: '30 min' },
            { time: '1:30-4:30', task: 'More registrations, file searches, billing disputes', duration: '180 min' },
            { time: '4:30-5:30', task: 'Call tomorrow\'s patients', duration: '60 min' },
            { time: '5:30-6:30', task: 'End-of-day cash tally + error hunting', duration: '60 min' },
          ].map(({ time, task, duration }) => (
            <div key={time} className="flex items-center gap-4 text-sm">
              <div className="w-20 flex-shrink-0 text-red-600 dark:text-red-400 font-semibold">{time}</div>
              <div className="flex-1 text-red-800 dark:text-red-200">{task}</div>
              <div className="w-16 text-right text-red-500 dark:text-red-400 font-medium">{duration}</div>
            </div>
          ))}
          <div className="pt-4 mt-4 border-t border-red-200 dark:border-red-800 space-y-1">
            <p className="text-red-800 dark:text-red-200 font-semibold">Total admin time: ~7 hours</p>
            <p className="text-red-600 dark:text-red-400 text-sm">Patient interaction time: incidentals only</p>
            <p className="text-red-600 dark:text-red-400 text-sm font-bold">Job satisfaction: zero</p>
          </div>
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800 p-8">
        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          After Automation (With Doxxy)
        </h3>
        <div className="space-y-4">
          {[
            { time: '9:00-9:15', task: 'Review today\'s schedule, prepare for the day', duration: '15 min' },
            { time: '9:15-11:00', task: 'Greet patients, assist with QR check-in, manage queue flow', duration: '105 min' },
            { time: '11:00-1:00', task: 'Handle special requests, assist elderly patients, ensure smooth patient flow', duration: '120 min' },
            { time: '1:00-2:00', task: 'Proper lunch break', duration: '60 min' },
            { time: '2:00-5:00', task: 'Patient coordination, follow-up scheduling, clinic operations', duration: '180 min' },
            { time: '5:00-5:15', task: 'Review dashboard — collections auto-reconciled', duration: '15 min' },
            { time: '5:15-5:30', task: 'Review tomorrow\'s auto-confirmed appointments', duration: '15 min' },
          ].map(({ time, task, duration }) => (
            <div key={time} className="flex items-center gap-4 text-sm">
              <div className="w-20 flex-shrink-0 text-green-600 dark:text-green-400 font-semibold">{time}</div>
              <div className="flex-1 text-green-800 dark:text-green-200">{task}</div>
              <div className="w-16 text-right text-green-500 dark:text-green-400 font-medium">{duration}</div>
            </div>
          ))}
          <div className="pt-4 mt-4 border-t border-green-200 dark:border-green-800 space-y-1">
            <p className="text-green-800 dark:text-green-200 font-semibold">Total admin time: ~1 hour</p>
            <p className="text-green-600 dark:text-green-400 text-sm">Patient interaction time: 5+ hours</p>
            <p className="text-green-600 dark:text-green-400 text-sm font-bold">Job: actually about patient care now</p>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section className="bg-muted">
    <SectionTitle>The Results: Same Staff. Radically Different Work.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Before and after. Manual versus automated. This is what changes when your team gets the right tools.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Before</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { before: 'Receptionist does data entry all day', after: 'Receptionist greets and assists patients' },
            { before: 'Manual call reminders (1 hour/day)', after: 'Auto WhatsApp reminders (0 min)' },
            { before: 'Manual billing with disputes', after: 'Auto-billing with UPI QR' },
            { before: '15-20 min per patient admin time', after: 'Under 5 min per patient' },
            { before: 'Staff tenure: 8-14 months average', after: 'Staff stay because the job is fulfilling' },
            { before: '₹2-4L/year in paperwork labour', after: '₹0 paperwork labour cost' },
            { before: 'Doctor does 1-1.5 hrs admin daily', after: 'Doctor does 0 min admin' },
          ].map(({ before, after }) => (
            <tr key={before} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 text-gray-600 dark:text-gray-300">{before}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Honest answers to the questions clinic owners ask before automating.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'How many hours does clinic software actually save staff per day?',
          a: 'Doxxy clinics report saving 3+ hours of staff time daily. Patient registration goes from 5 minutes to 30 seconds — a 90% reduction. Billing becomes automatic: the bill generates from the consultation record, so the receptionist only reviews and confirms instead of writing every line item manually. Appointment reminders become automated WhatsApp messages instead of 60 minutes of manual phone calls each evening. And end-of-day reconciliation — typically 30 minutes of tallying cash against a register — becomes a single click on a dashboard that is already accurate because every payment was matched in real time. Across registration, billing, reminders, and reconciliation, the typical clinic saves 15-20 hours of receptionist time per week.',
        },
        {
          q: 'My receptionist has no computer experience. Will they be able to use clinic software?',
          a: 'Doxxy is designed for non-technical users — specifically for the Indian clinic context where many receptionists have never used a computer before. If your receptionist can use WhatsApp, they can use Doxxy. The interface uses large buttons, clear labels in English and Hindi, and minimal menus. We see this consistently: staff who had never touched a computer are independently managing the full patient queue, generating bills, and sending WhatsApp reminders by the end of their first week. The learning curve is measured in days, not weeks. Our support team is available on WhatsApp and phone to help your staff through onboarding.',
        },
        {
          q: 'How does automation reduce staff burnout specifically?',
          a: 'Burnout comes from three specific sources: repetitive meaningless tasks (writing the same fields 30 times a day, every day), constant interruptions (patients asking about wait times, doctors asking for files), and having no tools to actually solve problems (searching through cabinets while patients get angry). Automation eliminates the repetition by handling data entry, billing math, and reminder calls. It reduces interruptions because patients can self-check their queue status on WhatsApp instead of asking the receptionist every 5 minutes. And it gives staff tools that work — instant record search, auto-reconciled payments, digital queue management — so they can actually help patients instead of being stuck in processes. The result: staff spend their day on human interaction instead of paperwork. The role transforms from data-entry clerk to patient experience coordinator. That transformation is what prevents burnout.',
        },
        {
          q: "What's the ROI of reducing staff turnover?",
          a: 'The math is straightforward. Replacing a receptionist costs ₹25,000-35,000 — job postings and interview time, 2-3 weeks of training and shadowing before the new person is productive, and the lost productivity during the transition when the replacement is slower and makes more mistakes. If automation extends average receptionist tenure from 12 months to 36 months, you save roughly ₹50,000-70,000 in turnover costs per staff member over 3 years. On top of that, you recover ₹1,35,000-2,40,000 per year in paperwork labour that is now automated — meaning your staff spend their time on patient care and revenue-generating activities instead of filing and tallying. The combined ROI typically exceeds ₹5,00,000 over 3 years for a single receptionist position.',
        },
        {
          q: 'Will automation make my staff lazy or redundant?',
          a: 'No. Automation removes busywork so staff can focus on what humans do uniquely well: greeting patients warmly, handling special situations with empathy, providing comfort to anxious patients, and ensuring the clinic runs smoothly. In manual clinics, receptionists are so buried in data entry and paperwork that they can barely look up from the register. In digital clinics, the software handles the repetitive tasks — the receptionist becomes the warm, capable face of your clinic. Receptionists in Doxxy clinics consistently report higher job satisfaction because their work is more meaningful. Their role shifts from data-entry clerk to patient experience coordinator. They do not become redundant — they become more valuable.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{q}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default function ReduceClinicStaffBurnout() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <WhySection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <FAQSection />
      <SignupCTA
        heading="Your Receptionist Spends 3+ Hours on Paperwork. Stop It."
        description="See how Doxxy automates the admin grind — appointment reminders, billing, report sharing — so your staff focuses on patients, not files."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Reduce Staff Burnout', url: `${APP_URL}/reduce-clinic-staff-burnout` },
        ]}
      />
    </div>
  );
}
