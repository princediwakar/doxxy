// Path: app/(public)/online-appointment-booking/page.tsx

import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Script from 'next/script';
import { ArrowRight, CheckCircle, Clock, Users, Smartphone, BellRing, CalendarCheck, BarChart3 } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Online Appointment Booking System for Indian Clinics — Doxxy',
  description: 'Let patients book online in 30 seconds. Reduce phone calls by 60%, cut no-shows by 40%, and save 3 hours of staff time daily. Built for busy Indian OPD clinics.',
  alternates: { canonical: '/online-appointment-booking' },
  openGraph: {
    title: 'Online Appointment Booking System for Indian Clinics — Doxxy',
    description: 'Let patients book online in 30 seconds. Reduce phone calls, cut no-shows, and save staff time with automated scheduling.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Online Appointment Booking' }],
  },
  keywords: ['online appointment booking for clinics', 'clinic appointment system', 'patient self-booking', 'doctor appointment software', 'OPD appointment scheduling', 'clinic booking platform India'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I still accept walk-in patients with online booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Doxxy is designed for the hybrid reality of Indian clinics. Your online booking slots and walk-in queue coexist in a single smart dashboard. When a walk-in patient arrives, your receptionist adds them to the queue with one click. The system automatically adjusts wait times for both online and walk-in patients, so nobody gets skipped and your OPD flows smoothly regardless of how patients arrive.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if a doctor\'s schedule changes suddenly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy handles schedule changes gracefully. If a doctor is running late, needs to leave early, or has an emergency, you can block or adjust slots in seconds. The system automatically notifies affected patients via WhatsApp and SMS, and offers them the next available slots. No manual calling required. Your schedule stays accurate and patients stay informed — reducing frustration and last-minute cancellations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can patients book for the same day?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You control the booking window — you can allow same-day bookings, next-day-only, or up to 30 days in advance. For same-day bookings, you can set a cutoff time (e.g., no online bookings after 4 PM for evening OPD). This gives you full flexibility while preventing patients from booking slots you cannot honour. Many clinics keep a few same-day slots open specifically for online booking to attract last-minute patients.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I set different slot durations for different doctors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each doctor in Doxxy gets their own schedule configuration. You can set custom consultation durations — for example, 10 minutes for a general physician, 20 minutes for a cardiologist, and 30 minutes for a new-patient consultation. You can also configure different OPD timings for each day of the week, block lunch breaks, and set buffer time between appointments. The system automatically enforces these rules so patients only see valid slots.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it work on WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — WhatsApp is a core part of Doxxy\'s booking system. Patients can receive their booking link via WhatsApp and book directly from their phone. After booking, they receive an instant WhatsApp confirmation. A reminder is automatically sent 24 hours before the appointment. If they need to reschedule, they can do it from the same WhatsApp link. For clinics that use WhatsApp as their primary patient communication channel, this eliminates the need for a separate patient app.',
      },
    },
  ],
};

export default function OnlineAppointmentBooking() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Stop Playing Phone Tag with Patients. Let Them Book Online in 30 Seconds.
        </h1>
        <SectionSubtitle>
          Indian clinic receptionists spend 3+ hours daily answering booking calls — most of them during peak OPD hours when patients are already waiting. Doxxy lets patients book themselves, so your staff can focus on patient care instead of phone calls.
        </SectionSubtitle>
        <div className="mt-10">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Your Receptionist Should Not Be a Phone Operator.</SectionTitle>
        <SectionSubtitle className="mt-4">
          But in most Indian clinics today, that is exactly what happens.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            The average Indian OPD receptionist handles <strong className="text-gray-900 dark:text-white">40 to 60 phone calls daily</strong> just for appointment scheduling. Each call takes 2-4 minutes — asking for name and phone number, checking the doctor&apos;s physical diary, finding a slot, reading it back, confirming twice because the patient did not catch it the first time over a bad connection.
          </p>
          <p className="text-lg leading-relaxed">
            Here is the brutal math: <strong className="text-gray-900 dark:text-white">3 to 4 hours per day</strong> — nearly half the receptionist&apos;s shift — is consumed by scheduling calls. And here is the kicker: <strong className="text-gray-900 dark:text-white">60% of those calls come during peak OPD hours</strong> (9 AM to 12 PM, and 5 PM to 8 PM), the exact time when patients are physically waiting at the counter, prescriptions need printing, and bills need generating. The phone keeps ringing while the queue keeps growing.
          </p>
          <p className="text-lg leading-relaxed">
            The worst part? Most of these calls are not complex consultations that need a human. They are simple slot checks. <strong className="text-gray-900 dark:text-white">&ldquo;Doctor sahab kaunse time pe baithe hain?&rdquo;</strong> <strong className="text-gray-900 dark:text-white">&ldquo;Kal subah ka slot hai kya?&rdquo;</strong> These are questions a website or WhatsApp link can answer in seconds — no receptionist required.
          </p>
          <p className="text-lg leading-relaxed">
            And the no-shows? Studies across Indian clinics show that <strong className="text-gray-900 dark:text-white">25% of phone-booked appointments</strong> result in no-shows because there is no automated reminder. Patients forget. They double-book. They show up on the wrong day. Your slot is wasted, and a patient who wanted that slot was turned away.
          </p>
        </div>
      </Section>

      {/* THE MATH */}
      <Section>
        <SectionTitle>The Numbers Don&apos;t Lie.</SectionTitle>
        <SectionSubtitle className="mt-4">
          What manual appointment scheduling costs your clinic every single day.
        </SectionSubtitle>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">3 hrs</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Saved Daily on Phone Scheduling</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Redirected to patient check-in and care coordination</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <BellRing className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">40%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Fewer No-Shows</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Automated WhatsApp & SMS reminders 24h before</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">+25%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">More Appointments Booked</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Patients book from home, after hours, on WhatsApp</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-blue-600 dark:text-blue-400 text-4xl font-extrabold">₹12,000</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Staff Cost Saved Monthly</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Redirecting scheduling hours to patient care and billing</p>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Self-Booking That Works the Way Indian Clinics Actually Operate.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Not a generic calendar app. A scheduling system built for the chaos and flow of a real Indian OPD.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Smartphone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Online Booking Page</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Every clinic gets a shareable booking page. Patients see available slots in real time, select a time, enter their name and phone number, and book — under 30 seconds. Share the link on your website, Google Business profile, or WhatsApp broadcast list.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M17 10H7v1h10z"/><path d="M17 13H7v1h10z"/><path d="M10 16H7v1h3z"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">WhatsApp Booking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Patients message your clinic on WhatsApp, receive an auto-reply with the booking link, and book without leaving WhatsApp. No app download needed. No website visit. Works on every phone — from the latest iPhone to a basic Android device.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <BellRing className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Automated Reminders</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Confirmation sent instantly. Reminder sent 24 hours before the appointment via WhatsApp and SMS. Customizable message templates — you can even send pre-appointment instructions (e.g., fasting requirements for blood tests) automatically.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <CalendarCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Smart Scheduling Engine</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Configure per-doctor slot durations, buffer times between appointments, break times, and OPD hours per day. The system prevents double-booking, handles walk-in + appointment hybrid workflows, and automatically adjusts available slots when a doctor&apos;s schedule changes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Waitlist Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              When a slot is full, patients can join a waitlist. If a cancellation opens a slot, the system automatically offers it to the next person on the list via WhatsApp. No manual calling. No wasted slots. Your clinic runs at full capacity every day.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <BarChart3 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Booking Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              See which time slots fill fastest, which doctors have the highest no-show rates, and what percentage of bookings come via WhatsApp vs website. Use these insights to optimize your OPD schedule and staffing for maximum patient throughput.
            </p>
          </div>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section>
        <SectionTitle>How Booking Works — for Patients and for You.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A three-step flow on the patient side, fully automated on the clinic side.
        </SectionSubtitle>

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Patient Books in 3 Steps</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  Opens Booking Link
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Patient clicks your booking link from WhatsApp, your website, or Google search. Sees your clinic name, available doctors, and real-time slot availability.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  Selects Slot & Confirms
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Chooses a convenient time, enters name and phone number, and confirms. Takes under 30 seconds. Works in Hindi, English, Marathi, and more.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  Gets Reminder
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Instant confirmation via WhatsApp. Automated reminder 24 hours before the appointment. Option to reschedule from the same link.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">What Happens on the Clinic Side</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">&#10003;</div>
                  Schedule Auto-Updates
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  The clinic dashboard updates instantly when a patient books. No phone call needed. Receptionists see today&apos;s schedule with booked, arrived, and completed statuses in one view.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">&#10003;</div>
                  Walk-Ins + Appointments
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Walk-in patients are added to the same queue with one click. The system intelligently interleaves booked appointments and walk-ins so your OPD flows smoothly.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-900/50">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">&#10003;</div>
                  Conflicts Prevented
                </h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  The system prevents double-booking automatically. If a doctor&apos;s schedule changes or a slot is blocked, affected patients are notified via WhatsApp immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* BEFORE/AFTER */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Before Doxxy vs After Doxxy.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The impact of switching from manual phone-based booking to online self-service.
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
                <td className="p-4 font-medium text-gray-900 dark:text-white">Booking Method</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Phone calls only. Patients call, receptionist manually checks a paper diary. 3-4 minutes per booking.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Online self-service + WhatsApp. Patient books in 30 seconds. No call needed.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Staff Time on Scheduling</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">3-4 hours/day on booking calls. Receptionist tied to the phone during peak OPD hours.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Under 30 minutes/day handling exceptions. Staff freed for check-in and patient care.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">After-Hours Booking</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Impossible. Clinic closes, no one answers the phone. Patients must call again tomorrow.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">24/7 booking. Patients book at 10 PM, on Sunday, anytime. Slots fill even when clinic is closed.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Confirmation Rate</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Verbally confirmed. No record of the call. Patients forget or mix up dates.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Written confirmation via WhatsApp. Permanent record. Patient can refer back anytime.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">No-Show Rate</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">~25% no-show rate. No reminder system. Patients forget appointments.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">~15% no-show rate (40% reduction). Automated WhatsApp reminder 24h before.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Rescheduling</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Another phone call. Receptionist erases and rewrites in the diary. Confusion and double-booking common.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Patient reschedules from the same WhatsApp link. Slot opens automatically. No staff involvement.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Waitlist Management</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Nonexistent. If a slot is full, the patient is turned away. Cancellations waste the slot.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Automated waitlist. Cancellations auto-offered to next person via WhatsApp. Zero wasted slots.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Patient Satisfaction</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Long hold times, miscommunication, frustration. Patients switch to clinics with easier booking.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Instant booking. Reminders. Rescheduling on their terms. Patients recommend your clinic to others.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Walk-In Management</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Walk-ins disrupt the schedule. No visibility into who is waiting vs who has an appointment.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Single dashboard shows booked + walk-in. Smart queue intelligently merges both flows.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Common questions about online appointment booking for clinics.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can I still accept walk-in patients with online booking?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Absolutely. Doxxy is designed for the hybrid reality of Indian clinics. Your online booking slots and walk-in queue coexist in a single smart dashboard. When a walk-in patient arrives, your receptionist adds them to the queue with one click. The system automatically adjusts wait times for both online and walk-in patients, so nobody gets skipped and your OPD flows smoothly regardless of how patients arrive.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What if a doctor&apos;s schedule changes suddenly?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Doxxy handles schedule changes gracefully. If a doctor is running late, needs to leave early, or has an emergency, you can block or adjust slots in seconds. The system automatically notifies affected patients via WhatsApp and SMS, and offers them the next available slots. No manual calling required. Your schedule stays accurate and patients stay informed — reducing frustration and last-minute cancellations.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can patients book for the same day?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. You control the booking window — you can allow same-day bookings, next-day-only, or up to 30 days in advance. For same-day bookings, you can set a cutoff time (e.g., no online bookings after 4 PM for evening OPD). This gives you full flexibility while preventing patients from booking slots you cannot honour. Many clinics keep a few same-day slots open specifically for online booking to attract last-minute patients.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do I set different slot durations for different doctors?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Each doctor in Doxxy gets their own schedule configuration. You can set custom consultation durations — for example, 10 minutes for a general physician, 20 minutes for a cardiologist, and 30 minutes for a new-patient consultation. You can also configure different OPD timings for each day of the week, block lunch breaks, and set buffer time between appointments. The system automatically enforces these rules so patients only see valid slots.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Does it work on WhatsApp?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes — WhatsApp is a core part of Doxxy&apos;s booking system. Patients can receive their booking link via WhatsApp and book directly from their phone. After booking, they receive an instant WhatsApp confirmation. A reminder is automatically sent 24 hours before the appointment. If they need to reschedule, they can do it from the same WhatsApp link. For clinics that use WhatsApp as their primary patient communication channel, this eliminates the need for a separate patient app.
            </p>
          </div>
        </div>

        <Script
          id="faq-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Section>

      {/* INTERNAL LINKS */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Complete Your Clinic&apos;s Digital Stack.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Online booking works best when paired with these Doxxy features.
        </SectionSubtitle>

        <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
          <Link href="/whatsapp-appointment-reminders" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">WhatsApp Reminders <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Automated appointment confirmations and reminders that cut no-shows by 40%.</p>
          </Link>
          <Link href="/clinic-queue-management" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Queue Management <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Manage walk-ins and booked patients in one intelligent queue. No more chaotic waiting rooms.</p>
          </Link>
          <Link href="/electronic-medical-records" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Electronic Medical Records <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Pull up patient history instantly when they arrive. No filing cabinets needed.</p>
          </Link>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center">
        <SectionTitle>Turn Your Receptionist Back into a Patient-Care Coordinator.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Stop wasting 3+ hours daily on booking calls. Let patients book themselves online, get automated reminders, and free your staff for what actually matters — caring for the patients in front of them.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">View Pricing Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="Let Patients Book Themselves — Your Receptionist Will Thank You"
        description="Online self-booking with real-time slot visibility. See how it works for your clinic — a 15-minute WhatsApp walkthrough."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Online Appointment Booking", url: `${APP_URL}/online-appointment-booking` },
        ]}
      />
    </div>
  );
}
