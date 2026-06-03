// Path: app/(public)/bn/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, ReceiptText, FileText, CalendarCheck, Users, BarChart3, Clock, TrendingDown, Zap, DollarSign, HeartHandshake } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার — ডক্সি | অ্যাপয়েন্টমেন্ট, বিলিং, রোগীর রেকর্ড',
  description: 'ডক্সি হল ভারতীয় ডাক্তারদের জন্য আধুনিক ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার। অ্যাপয়েন্টমেন্ট, ডিজিটাল বিলিং, রোগীর রেকর্ড, হোয়াটসঅ্যাপ রিমাইন্ডার — সব এক জায়গায়। কলকাতা, হাওড়া, দুর্গাপুর-সহ সারা বাংলায় ব্যবহৃত।',
  alternates: {
    canonical: '/bn',
    languages: {
      'bn': '/bn',
      'hi': '/hi',
      'kn': '/kn',
      'mr': '/mr',
      'ta': '/ta',
      'te': '/te',
    },
  },
  openGraph: {
    title: 'ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার — ডক্সি | অ্যাপয়েন্টমেন্ট, বিলিং, রোগীর রেকর্ড',
    description: 'ডক্সি হল ভারতীয় ডাক্তারদের জন্য আধুনিক ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার। অ্যাপয়েন্টমেন্ট, ডিজিটাল বিলিং, রোগীর রেকর্ড, হোয়াটসঅ্যাপ রিমাইন্ডার — সব এক জায়গায়।',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'ডক্সি ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার' }],
  },
  keywords: ['ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার', 'ডাক্তারদের জন্য সফটওয়্যার', 'ক্লিনিক অ্যাপয়েন্টমেন্ট সিস্টেম', 'রোগী রেকর্ড সফটওয়্যার', 'ক্লিনিক বিলিং সফটওয়্যার', 'ডক্সি'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ডক্সি ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার কী এবং এটি কীভাবে কাজ করে?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ডক্সি হল ভারতীয় ডাক্তারদের জন্য তৈরি একটি সম্পূর্ণ ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার। এটি আপনার ক্লিনিকের অ্যাপয়েন্টমেন্ট বুকিং, ডিজিটাল বিলিং, রোগীর রেকর্ড সংরক্ষণ, হোয়াটসঅ্যাপ রিমাইন্ডার, কিউ ম্যানেজমেন্ট এবং অ্যানালিটিক্স — সব একটি প্ল্যাটফর্মে নিয়ে আসে। ডক্সি ইন্টারনেট-সংযুক্ত যেকোনো ডিভাইসে কাজ করে — কম্পিউটার, ল্যাপটপ, বা ট্যাবলেট। আপনার রিসেপশনিস্ট অ্যাপয়েন্টমেন্ট বুক করেন, ডক্সি স্বয়ংক্রিয়ভাবে রোগীকে হোয়াটসঅ্যাপ রিমাইন্ডার পাঠায়, ডাক্তারবাবু রোগীর পুরনো প্রেসক্রিপশন ও রিপোর্ট দেখতে পান, এবং বিলিং মাত্র কয়েক সেকেন্ডে সম্পন্ন হয়। সবথেকে বড় কথা — এটি বাংলা ভাষায়ও ব্যবহার করা যায়, যা কলকাতা, হাওড়া, দুর্গাপুরের ক্লিনিকগুলির জন্য অত্যন্ত সুবিধাজনক।',
      },
    },
    {
      '@type': 'Question',
      name: 'ডক্সি কি শুধুমাত্র বড় ক্লিনিকের জন্য, নাকি ছোট চেম্বারেও ব্যবহার করা যায়?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ডক্সি বিশেষভাবে তৈরি করা হয়েছে ছোট ও মাঝারি ক্লিনিকের জন্য। আপনি একজন সিঙ্গল-ডক্টর চেম্বার চালান, বা পাঁচ জন ডাক্তারের একটি পলিক্লিনিক — ডক্সি আপনার প্রয়োজন অনুযায়ী কাজ করে। কলকাতার গড়িয়াহাট, যাদবপুর বা হাওড়ার শিবপুরের মতো জায়গায় যেসব ডাক্তারবাবুরা একা প্র্যাকটিস করেন, তাঁদের জন্য ডক্সির প্র্যাকটিস এসেনশিয়ালস প্ল্যান একদম সাশ্রয়ী — মাত্র ₹১০ প্রতি কনসাল্টেশন। কোনো লুকোনো খরচ নেই। কোনো বড় ইনস্টলেশন বা হার্ডওয়্যারের প্রয়োজন নেই। শুধু একটি ইন্টারনেট সংযোগ হলেই শুরু করা যায়।',
      },
    },
    {
      '@type': 'Question',
      name: 'আমি কি বাংলা ভাষায় রোগীদের হোয়াটসঅ্যাপ রিমাইন্ডার পাঠাতে পারব?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'অবশ্যই। ডক্সি ১৩টি ভারতীয় ভাষায় হোয়াটসঅ্যাপ রিমাইন্ডার পাঠাতে পারে, যার মধ্যে বাংলা অন্যতম। পশ্চিমবঙ্গের ক্লিনিকগুলির জন্য এটি বিশেষভাবে গুরুত্বপূর্ণ — আপনার রোগীরা যখন বাংলায় "আপনার আগামীকাল সকাল ১০টায় অ্যাপয়েন্টমেন্ট আছে" মেসেজ পান, তখন তাঁরা সেটি পড়েন এবং বিশ্বাস করেন। মেশিন-অনুবাদিত নয় — সম্পূর্ণ স্বাভাবিক, আঞ্চলিক বাংলা ভাষায় মেসেজ তৈরি করা থাকে। কলকাতা, হাওড়া, দুর্গাপুর — যেখানেই আপনার ক্লিনিক থাকুক না কেন, আপনার রোগীরা তাঁদের মাতৃভাষায় যোগাযোগ পাবেন।',
      },
    },
    {
      '@type': 'Question',
      name: 'ডক্সি ব্যবহার করতে গেলে আমার কী কী প্রয়োজন হবে?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ডক্সি ব্যবহার করা অত্যন্ত সহজ। আপনার শুধু প্রয়োজন: (১) একটি ইন্টারনেট-সংযুক্ত ডিভাইস — কম্পিউটার, ল্যাপটপ, বা ট্যাবলেট, (২) একটি ব্রাউজার — গুগল ক্রোম বা যেকোনো আধুনিক ব্রাউজার, এবং (৩) ডক্সি অ্যাকাউন্ট। কোনো সফটওয়্যার ডাউনলোড বা ইনস্টল করার দরকার নেই। ডক্সি সম্পূর্ণ ক্লাউড-ভিত্তিক — আপনার ডেটা সুরক্ষিত থাকে এবং যেকোনো জায়গা থেকে অ্যাক্সেস করা যায়। রিসেপশনিস্টের জন্য আলাদা ট্রেনিংয়েরও প্রয়োজন নেই — ইন্টারফেস এতটাই সোজা যে একদিনেই সব শিখে ফেলা যায়। আমরা ব্যক্তিগতভাবে অনবোর্ডিং করিয়ে দিই এবং ২৪/৭ সাপোর্ট দিয়ে থাকি।',
      },
    },
    {
      '@type': 'Question',
      name: 'ডক্সি কি বাংলার ছোট শহর ও গ্রামীণ ক্লিনিকের জন্য উপযুক্ত?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'হ্যাঁ, একদমই। ডক্সি এমনভাবে ডিজাইন করা হয়েছে যাতে শহর ও গ্রাম — সব জায়গায় সমানভাবে কাজ করে। দুর্গাপুর, আসানসোল, বর্ধমান, বহরমপুর, শিলিগুড়ির মতো ছোট শহর বা মফস্বল এলাকায় যেখানে ইন্টারনেট কানেক্টিভিটি তুলনামূলকভাবে কমজোরি হতে পারে, সেখানেও ডক্সি লো-ব্যান্ডউইথ মোডে চলে। শুধুমাত্র ২জি কানেকশনেও আপনি রোগীর রেকর্ড দেখতে, বিল করতে এবং অ্যাপয়েন্টমেন্ট বুক করতে পারবেন। বাংলার প্রতিটি প্রান্তের ডাক্তারবাবু যাতে ডিজিটাল প্র্যাকটিসের সুবিধা পান, সেটাই আমাদের লক্ষ্য।',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      আপনার ক্লিনিক চালান<br/>কাগজ-কলম নয়, <span className="text-blue-600 dark:text-blue-400">ডিজিটাল শক্তিতে।</span>
    </h1>
    <SectionSubtitle>
      ডক্সি — ভারতীয় ডাক্তারদের জন্য আধুনিক ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার। অ্যাপয়েন্টমেন্ট, বিলিং, রোগীর রেকর্ড, হোয়াটসঅ্যাপ রিমাইন্ডার, কিউ ম্যানেজমেন্ট — সব এক জায়গায়। কলকাতা, হাওড়া, দুর্গাপুর-সহ বাংলার ৫০০-র বেশি ক্লিনিকে ব্যবহৃত।
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">ফ্রিতে শুরু করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>বাংলার ক্লিনিকগুলো এখনো কাগজের বোঝা বইছে।</SectionTitle>
    <SectionSubtitle className="mt-4">
      বাইরে থেকে যতই আধুনিক লাগুক, ডেস্কের ভেতরটা এখনো রেজিস্টার-খাতায় ভরা — এবং এটাই ধীরে ধীরে আপনার প্র্যাকটিসকে থামিয়ে দিচ্ছে।
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        ভাবুন তো, কলকাতার গড়িয়াহাট বা হাওড়ার শিবপুরে আপনার চেম্বারের একটা সাধারণ সকালের কথা। রিসেপশনে দশ-বারোজন রোগী লাইনে দাঁড়িয়ে। রিসেপশনিস্ট দিদিমণি একহাতে ফোন ধরছেন, আরেক হাতে অ্যাপয়েন্টমেন্ট রেজিস্টার খুলে নাম লিখছেন। ডাক্তারবাবু চেম্বারে বসে রোগী দেখছেন, কিন্তু মাঝেমাঝেই রিসেপশনে গিয়ে জিজ্ঞেস করছেন — "কার্ডটা কোথায়? গতবার কী প্রেসক্রিপশন দিয়েছিলাম?" রেজিস্টার খাতায় পাতা উল্টে খুঁজতে গিয়ে পাঁচ মিনিট চলে যাচ্ছে। রোগীরা বিরক্ত। স্টাফ ক্লান্ত। আপনি হতাশ।
      </p>
      <p>
        এটা কোনো স্টাফের দোষ নয়। এটা রোগী-ভালোবাসার অভাব নয়। এটা একটা সিস্টেমের সমস্যা — কাগজের সিস্টেম। বাংলার ক্লিনিকগুলির একটা সমৃদ্ধ ঐতিহ্য আছে। কলকাতার মেডিকেল কলেজ থেকে পাশ করা তিন প্রজন্মের ডাক্তার পরিবার, দক্ষিণ শহরতলির ঘিঞ্জি গলির ভেতরে লুকানো চেম্বার, দুর্গাপুরের ব্যস্ত ইন্ডাস্ট্রিয়াল এরিয়ার ক্লিনিক — এদের প্রত্যেকটার একটা নিজস্ব গল্প আছে, রোগীদের সঙ্গে একটা ব্যক্তিগত সম্পর্ক আছে। কিন্তু সেই সম্পর্ক টিকিয়ে রাখতে গেলে সময় দরকার। আর সময় বেরোয় কোথা থেকে, যখন আপনার দিনের তিন-চার ঘণ্টা চলে যায় শুধু কাগজ সামলাতে?
      </p>
      <p>
        পশ্চিমবঙ্গের একটি গড় ক্লিনিক প্রতিদিন ৮-১৫টি অ্যাপয়েন্টমেন্ট স্লট হারায় শুধুমাত্র নো-শো বা ভুল বুকিংয়ের কারণে। প্রতিটি খালি স্লট মানে ₹৩০০-₹১,০০০ লোকসান — শুধু কনসাল্টেশন ফি নয়, ফলো-আপ ভিজিট, ফার্মেসি রেফারেল, ডায়াগনস্টিক টেস্টের পুরো চেইনটা হাতছাড়া হয়ে যায়। বছরে হিসেব করলে দাঁড়ায় প্রায় ₹১,০০,০০০-₹১,৮০,০০০ — শুধুমাত্র এই ফাঁকা চেয়ারগুলোর জন্য।
      </p>
      <p>
        অথচ সমাধানটা একদম হাতের কাছেই। আপনি যখন বাংলায় রোগীকে একটা হোয়াটসঅ্যাপ মেসেজ পাঠাতে পারেন — "আপনার আগামীকাল ডাঃ মুখার্জির চেম্বারে সকাল ১০টায় অ্যাপয়েন্টমেন্ট" — রোগী সেটা পড়েন, বিশ্বাস করেন, আর সময়মতো হাজির হন। কাগজের রেজিস্টার নয় — ডিজিটাল। বিশৃঙ্খলা নয় — গোছানো সিস্টেম। ব্যস্ততা নয় — মন দিয়ে রোগী দেখার সময়।
      </p>
    </div>
  </Section>
);

const StatsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>পরিসংখ্যান যা চোখ খুলে দেবে।</SectionTitle>
    <SectionSubtitle className="mt-4">
      কাগজ-নির্ভর প্র্যাকটিস বনাম ডিজিটাল ক্লিনিক — সংখ্যাগুলো নিজের চোখে দেখুন।
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: Clock, stat: '৩-৪ ঘণ্টা', label: 'প্রতিদিন কাগজ সামলাতে নষ্ট', detail: 'একটি গড় ক্লিনিকে রিসেপশনিস্টরা প্রতিদিন ৩-৪ ঘণ্টা শুধু রেজিস্টার লেখা, প্রেসক্রিপশন খোঁজা আর ফোন করতে ব্যয় করেন। ডক্সি এই সময়কে নামিয়ে আনে শূন্যের কাছাকাছি।' },
        { icon: TrendingDown, stat: '৩৫%', label: 'নো-শো হ্রাস', detail: 'হোয়াটসঅ্যাপ রিমাইন্ডার চালু করার ৬০ দিনের মধ্যে ক্লিনিকগুলি গড়ে ৩৫% নো-শো কমাতে সক্ষম হয়েছে।' },
        { icon: Users, stat: '৫০০+', label: 'বাংলার ক্লিনিক ব্যবহার করছে', detail: 'কলকাতা, হাওড়া, দুর্গাপুর-সহ গোটা পশ্চিমবঙ্গের ৫০০-র বেশি ক্লিনিক ইতিমধ্যেই ডক্সির উপর নির্ভর করছে।' },
        { icon: CalendarCheck, stat: '২৪ ঘণ্টা', label: 'অনলাইন বুকিং', detail: 'আপনার রোগীরা দিন-রাত ২৪ ঘণ্টা অনলাইনে অ্যাপয়েন্টমেন্ট বুক করতে পারেন — রিসেপশনে ফোন করার দরকার নেই।' },
        { icon: DollarSign, stat: '₹১.৮ লক্ষ', label: 'বার্ষিক সঞ্চয়', detail: 'একটি সিঙ্গল-ডক্টর ক্লিনিক নো-শো কমিয়ে এবং বিলিং অটোমেট করে বছরে গড়ে ₹১,৮০,০০০ সাশ্রয় করে।' },
        { icon: Zap, stat: '২ মিনিট', label: 'বিলিং সম্পন্ন', detail: 'ডক্সির ডিজিটাল বিলিং-এ একটি রোগীর বিল করতে সময় লাগে মাত্র ২ মিনিট — কাগজের বিলের ধকল থেকে সম্পূর্ণ মুক্তি।' },
      ].map(({ icon: Icon, stat, label, detail }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const FeaturesSection = () => (
  <Section>
    <SectionTitle>ডক্সি আপনার ক্লিনিকের জন্য কী কী করতে পারে।</SectionTitle>
    <SectionSubtitle className="mt-4">
      ছয়টি শক্তিশালী ফিচার যা আপনার ক্লিনিককে কাগজ-কলমের যুগ থেকে ডিজিটাল যুগে নিয়ে আসে।
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {[
        {
          icon: MessageCircle,
          title: 'হোয়াটসঅ্যাপ রিমাইন্ডার',
          description: 'বাংলা ভাষায় স্বয়ংক্রিয় হোয়াটসঅ্যাপ রিমাইন্ডার। আপনার রোগী অ্যাপয়েন্টমেন্টের ২৪ ঘণ্টা আগে ডাক্তারের নাম, সময়, ঠিকানা এবং গুগল ম্যাপ লিংক-সহ রিমাইন্ডার পান। এক ট্যাপে কনফার্ম বা রিশিডিউল করতে পারেন। নো-শো কমেছে ৩৫% — প্রমাণিত।',
          link: '/whatsapp-appointment-reminders',
        },
        {
          icon: ReceiptText,
          title: 'ডিজিটাল বিলিং',
          description: 'জিএসটি-সাপোর্টেড ডিজিটাল বিলিং সিস্টেম। মাত্র ২ মিনিটে সম্পূর্ণ বিল তৈরি। ওষুধ, টেস্ট, কনসাল্টেশন ফি — সব আলাদা করে উল্লেখ করা যায়। রোগীকে হোয়াটসঅ্যাপ বা ইমেইলে ইনভয়েস পাঠানোর ব্যবস্থা।',
          link: '/clinic-billing-software',
        },
        {
          icon: FileText,
          title: 'ইলেকট্রনিক মেডিকেল রেকর্ডস (EMR)',
          description: 'রোগীর সম্পূর্ণ মেডিকেল হিস্ট্রি — প্রেসক্রিপশন, ল্যাব রিপোর্ট, ডায়াগনসিস, অ্যালার্জি — সব ডিজিটাল ফরম্যাটে এক জায়গায়। সার্চ করতে সেকেন্ড লাগে। কাগজের ফাইল উল্টোতে হয় না।',
          link: '/electronic-medical-records',
        },
        {
          icon: CalendarCheck,
          title: 'অনলাইন অ্যাপয়েন্টমেন্ট বুকিং',
          description: 'আপনার রোগীরা ২৪×৭ অনলাইনে অ্যাপয়েন্টমেন্ট বুক করতে পারেন। রিসেপশনিস্টের ফোন ব্যস্ত থাকা বা রাতে ফোন না ধরার সমস্যা চিরতরে শেষ। অ্যাপয়েন্টমেন্ট স্লট স্বয়ংক্রিয়ভাবে ম্যানেজ হয়।',
          link: '/online-appointment-booking',
        },
        {
          icon: Users,
          title: 'কিউ ম্যানেজমেন্ট',
          description: 'ওয়েটিং রুমের ভিড় কমান। কে কখন আসবেন, কতক্ষণ অপেক্ষা করতে হবে — রোগীকে রিয়েল-টাইমে জানিয়ে দিন। রিসেপশনিস্ট পরিষ্কার দেখতে পান কাকে আগে পাঠাতে হবে। কলকাতার ব্যস্ত চেম্বারের জন্য একদম আদর্শ।',
          link: '/clinic-queue-management',
        },
        {
          icon: BarChart3,
          title: 'অ্যানালিটিক্স ও রিপোর্ট',
          description: 'প্রতিদিন কত রোগী দেখা হয়েছে, কোন রোগ সবচেয়ে বেশি আসে, রেভিনিউ ট্রেন্ড কেমন — সব চার্ট আর গ্রাফে দেখুন। ব্যবসায়িক সিদ্ধান্ত নিন ডেটার ভিত্তিতে, আন্দাজে নয়।',
          link: '/clinic-analytics-dashboard',
        },
      ].map(({ icon: Icon, title, description, link }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          <Link href={link} className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            বিস্তারিত জানুন <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>ডক্সি কীভাবে কাজ করে — চারটি সহজ ধাপ।</SectionTitle>
    <SectionSubtitle className="mt-4">
      কোনোরকম টেকনিক্যাল জ্ঞান ছাড়াই। শুধু খুলে বসুন আর ব্যবহার শুরু করুন।
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '১', title: 'সাইন আপ করুন', description: 'ডক্সি ওয়েবসাইটে গিয়ে ফ্রি অ্যাকাউন্ট খুলুন। মাত্র ২ মিনিটে রেজিস্ট্রেশন সম্পন্ন। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।' },
        { step: '২', title: 'ক্লিনিক সেটআপ', description: 'আপনার ক্লিনিকের তথ্য, ডাক্তারের নাম, সময়সূচি, ফি স্ট্রাকচার বসিয়ে দিন। আমাদের টিম চাইলে ব্যক্তিগতভাবে অনবোর্ডিং করে দেবে।' },
        { step: '৩', title: 'রোগী ভর্তি শুরু', description: 'আপনার রিসেপশনিস্ট সহজেই রোগীর নাম, ফোন নম্বর দিয়ে রেজিস্ট্রেশন করান। পুরনো রোগীদের ডেটাও আপলোড করে দেওয়া যায়।' },
        { step: '৪', title: 'অটোমেশন চালু', description: 'এবার বসে দেখুন — অ্যাপয়েন্টমেন্ট বুক হচ্ছে, হোয়াটসঅ্যাপ রিমাইন্ডার যাচ্ছে, বিল তৈরি হচ্ছে। আপনার কাজ শুধু রোগী দেখা। বাকিটা ডক্সির দায়িত্ব।' },
      ].map(({ step, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              {title}
            </h4>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>আপনার ক্লিনিক — ডক্সির আগে ও পরে।</SectionTitle>
    <SectionSubtitle className="mt-4">
      এটি কোনো প্রতিযোগীর সঙ্গে তুলনা নয়। এটি আপনার নিজের ক্লিনিকের বর্তমান অবস্থা বনাম ডক্সি ব্যবহারের পরের অবস্থা।
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">বিভাগ</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">ডক্সি ছাড়া</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">ডক্সি-র সঙ্গে</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'রোগী নো-শো', before: 'বুক করা রোগীর ২০-৩০%', after: '১০-১৫% — ৩৫% হ্রাস' },
            { metric: 'রিসেপশনের সময়', before: 'দিনে ৩-৪ ঘণ্টা ফোন ও রেজিস্টারে', after: 'শূন্য — সম্পূর্ণ অটোমেটেড' },
            { metric: 'বিলিং সময়', before: 'প্রতি বিলে ৮-১০ মিনিট', after: 'প্রতি বিলে ২ মিনিট' },
            { metric: 'পুরনো রেকর্ড খোঁজা', before: 'ফাইল-রেজিস্টার উল্টে ৫-১০ মিনিট', after: 'সার্চ করে ৫ সেকেন্ড' },
            { metric: 'রোগীর সন্তুষ্টি', before: 'লম্বা অপেক্ষা, কাগজের ঝামেলা', after: 'পরিষ্কার সময়সূচি, পেশাদার অভিজ্ঞতা' },
            { metric: 'মাসিক রেভিনিউ', before: 'নো-শো ও বিলিং ফাঁকের কারণে লোকসান', after: 'নো-শো কমে, বিলিং নিখুঁত — রেভিনিউ বৃদ্ধি' },
            { metric: 'স্টাফ স্ট্রেস', before: 'ফোন, রেজিস্টার, রোগীর চাপ — সব একসঙ্গে', after: 'অর্ডারলি ওয়ার্কফ্লো — সবার কাজ পরিষ্কার' },
            { metric: 'ক্লিনিকের ভাবমূর্তি', before: 'সেকেলে কাগজ-কলমে প্র্যাকটিস', after: 'আধুনিক ডিজিটাল ক্লিনিক — রোগীর আস্থা বৃদ্ধি' },
          ].map(({ metric, before, after }) => (
            <tr key={metric} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{metric}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">{before}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const WhyBengalSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>বাংলার ক্লিনিকের জন্য কেন ডক্সি আলাদা।</SectionTitle>
    <SectionSubtitle className="mt-4">
      কলকাতার ঐতিহ্যবাহী চেম্বার থেকে দুর্গাপুরের আধুনিক ক্লিনিক — ডক্সি সবার জন্য তৈরি।
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          icon: HeartHandshake,
          title: 'বাংলার পারিবারিক ডাক্তারি সংস্কৃতির প্রতি শ্রদ্ধা',
          description: 'বাংলায় ডাক্তার-রোগীর সম্পর্ক শুধু প্রেসক্রিপশনের মধ্যে সীমাবদ্ধ নয় — এটা একটা বিশ্বাসের সম্পর্ক, প্রায় পরিবারের মতো। ডক্সি সেই সম্পর্ককে সম্মান জানায়। আমরা এমন কোনো অটোমেশন তৈরি করিনি যা ডাক্তারবাবুকে রোগী থেকে দূরে সরিয়ে দেয়। বরং কাগজপত্রের ঝামেলা সরিয়ে দিয়ে, ডাক্তারবাবুকে রোগীর সঙ্গে আরও বেশি সময় কাটানোর সুযোগ করে দিই।',
        },
        {
          icon: MessageCircle,
          title: 'বাংলা ভাষায় সম্পূর্ণ সাপোর্ট',
          description: 'ডক্সির ইন্টারফেস বাংলায় ব্যবহার করা যায়। হোয়াটসঅ্যাপ রিমাইন্ডার বাংলায় যায়। আপনার রিসেপশনিস্ট দিদিমণি যিনি ইংরেজি-তে স্বচ্ছন্দ নন, তিনিও অনায়াসে ডক্সি ব্যবহার করতে পারেন। এটি বাংলার বাস্তবতার প্রতি আমাদের অঙ্গীকার।',
        },
        {
          icon: Users,
          title: 'বহু-প্রজন্মের ক্লিনিক পরিবারের জন্য তৈরি',
          description: 'কলকাতায় এমন অনেক পরিবার আছেন যেখানে তিন প্রজন্ম ধরে ডাক্তারি চলছে — দাদু, বাবা, ছেলে একই চেম্বারে প্র্যাকটিস করেন। ডক্সির মাল্টি-ডক্টর সিস্টেম প্রতিটি ডাক্তারের আলাদা প্রোফাইল, সময়সূচি ও রোগী-তালিকা রাখে। দাদুর পুরনো রোগী যাঁরা এখন ছেলের কাছে আসেন, তাঁদের সম্পূর্ণ মেডিকেল হিস্ট্রি এক ক্লিকে দেখা যায়।',
        },
        {
          icon: TrendingDown,
          title: 'কম ইন্টারনেটেও সম্পূর্ণ কার্যকরী',
          description: 'বাংলার অনেক জায়গায় — মফস্বল, গ্রামীণ এলাকা বা দুর্গাপুরের বাইরের ইন্ডাস্ট্রিয়াল বেল্টে — ইন্টারনেট কানেক্টিভিটি সবসময় নির্ভরযোগ্য নয়। ডক্সির লো-ব্যান্ডউইথ মোড ২জি কানেকশনেও কাজ করে। আপনি বর্ধমানের একটা গ্রামে বসেও ডিজিটাল ক্লিনিক চালাতে পারবেন।',
        },
      ].map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>সাধারণ জিজ্ঞাসা।</SectionTitle>
    <SectionSubtitle className="mt-4">
      ডক্সি নিয়ে বাংলার ক্লিনিক মালিকদের সবচেয়ে সাধারণ প্রশ্ন ও উত্তর।
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'ডক্সি ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার কী এবং এটি কীভাবে কাজ করে?',
          a: 'ডক্সি হল ভারতীয় ডাক্তারদের জন্য তৈরি একটি সম্পূর্ণ ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার। এটি আপনার ক্লিনিকের অ্যাপয়েন্টমেন্ট বুকিং, ডিজিটাল বিলিং, রোগীর রেকর্ড সংরক্ষণ, হোয়াটসঅ্যাপ রিমাইন্ডার, কিউ ম্যানেজমেন্ট এবং অ্যানালিটিক্স — সব একটি প্ল্যাটফর্মে নিয়ে আসে। ডক্সি ইন্টারনেট-সংযুক্ত যেকোনো ডিভাইসে কাজ করে — কম্পিউটার, ল্যাপটপ, বা ট্যাবলেট। আপনার রিসেপশনিস্ট অ্যাপয়েন্টমেন্ট বুক করেন, ডক্সি স্বয়ংক্রিয়ভাবে রোগীকে হোয়াটসঅ্যাপ রিমাইন্ডার পাঠায়, ডাক্তারবাবু রোগীর পুরনো প্রেসক্রিপশন ও রিপোর্ট দেখতে পান, এবং বিলিং মাত্র কয়েক সেকেন্ডে সম্পন্ন হয়। সবথেকে বড় কথা — এটি বাংলা ভাষায়ও ব্যবহার করা যায়, যা কলকাতা, হাওড়া, দুর্গাপুরের ক্লিনিকগুলির জন্য অত্যন্ত সুবিধাজনক। বিস্তারিত জানতে দেখুন: <Link href="/what-is-clinic-management-software" className="text-blue-600 hover:underline">ক্লিনিক ম্যানেজমেন্ট সফটওয়্যার কী</Link>।',
        },
        {
          q: 'ডক্সি কি শুধুমাত্র বড় ক্লিনিকের জন্য, নাকি ছোট চেম্বারেও ব্যবহার করা যায়?',
          a: 'ডক্সি বিশেষভাবে তৈরি করা হয়েছে ছোট ও মাঝারি ক্লিনিকের জন্য। আপনি একজন সিঙ্গল-ডক্টর চেম্বার চালান, বা পাঁচ জন ডাক্তারের একটি পলিক্লিনিক — ডক্সি আপনার প্রয়োজন অনুযায়ী কাজ করে। কলকাতার গড়িয়াহাট, যাদবপুর বা হাওড়ার শিবপুরের মতো জায়গায় যেসব ডাক্তারবাবুরা একা প্র্যাকটিস করেন, তাঁদের জন্য ডক্সির প্র্যাকটিস এসেনশিয়ালস প্ল্যান একদম সাশ্রয়ী — মাত্র ₹১০ প্রতি কনসাল্টেশন। কোনো লুকোনো খরচ নেই। কোনো বড় ইনস্টলেশন বা হার্ডওয়্যারের প্রয়োজন নেই। শুধু একটি ইন্টারনেট সংযোগ হলেই শুরু করা যায়। দেখুন: <Link href="/clinic-software-small-clinic" className="text-blue-600 hover:underline">ছোট ক্লিনিকে সফটওয়্যার</Link>।',
        },
        {
          q: 'আমি কি বাংলা ভাষায় রোগীদের হোয়াটসঅ্যাপ রিমাইন্ডার পাঠাতে পারব?',
          a: 'অবশ্যই। ডক্সি ১৩টি ভারতীয় ভাষায় হোয়াটসঅ্যাপ রিমাইন্ডার পাঠাতে পারে, যার মধ্যে বাংলা অন্যতম। পশ্চিমবঙ্গের ক্লিনিকগুলির জন্য এটি বিশেষভাবে গুরুত্বপূর্ণ — আপনার রোগীরা যখন বাংলায় "আপনার আগামীকাল সকাল ১০টায় অ্যাপয়েন্টমেন্ট আছে" মেসেজ পান, তখন তাঁরা সেটি পড়েন এবং বিশ্বাস করেন। মেশিন-অনুবাদিত নয় — সম্পূর্ণ স্বাভাবিক, আঞ্চলিক বাংলা ভাষায় মেসেজ তৈরি করা থাকে। কলকাতা, হাওড়া, দুর্গাপুর — যেখানেই আপনার ক্লিনিক থাকুক না কেন, আপনার রোগীরা তাঁদের মাতৃভাষায় যোগাযোগ পাবেন। আরও জানুন: <Link href="/whatsapp-appointment-reminders" className="text-blue-600 hover:underline">হোয়াটসঅ্যাপ রিমাইন্ডার</Link>।',
        },
        {
          q: 'ডক্সি ব্যবহার করতে গেলে আমার কী কী প্রয়োজন হবে?',
          a: 'ডক্সি ব্যবহার করা অত্যন্ত সহজ। আপনার শুধু প্রয়োজন: (১) একটি ইন্টারনেট-সংযুক্ত ডিভাইস — কম্পিউটার, ল্যাপটপ, বা ট্যাবলেট, (২) একটি ব্রাউজার — গুগল ক্রোম বা যেকোনো আধুনিক ব্রাউজার, এবং (৩) ডক্সি অ্যাকাউন্ট। কোনো সফটওয়্যার ডাউনলোড বা ইনস্টল করার দরকার নেই। ডক্সি সম্পূর্ণ ক্লাউড-ভিত্তিক — আপনার ডেটা সুরক্ষিত থাকে এবং যেকোনো জায়গা থেকে অ্যাক্সেস করা যায়। রিসেপশনিস্টের জন্য আলাদা ট্রেনিংয়েরও প্রয়োজন নেই — ইন্টারফেস এতটাই সোজা যে একদিনেই সব শিখে ফেলা যায়। আমরা ব্যক্তিগতভাবে অনবোর্ডিং করিয়ে দিই এবং ২৪/৭ সাপোর্ট দিয়ে থাকি। কাগজ বনাম ডিজিটাল তুলনা দেখুন: <Link href="/clinic-software-vs-paper" className="text-blue-600 hover:underline">সফটওয়্যার বনাম কাগজ</Link>।',
        },
        {
          q: 'ডক্সি কি বাংলার ছোট শহর ও গ্রামীণ ক্লিনিকের জন্য উপযুক্ত?',
          a: 'হ্যাঁ, একদমই। ডক্সি এমনভাবে ডিজাইন করা হয়েছে যাতে শহর ও গ্রাম — সব জায়গায় সমানভাবে কাজ করে। দুর্গাপুর, আসানসোল, বর্ধমান, বহরমপুর, শিলিগুড়ির মতো ছোট শহর বা মফস্বল এলাকায় যেখানে ইন্টারনেট কানেক্টিভিটি তুলনামূলকভাবে কমজোরি হতে পারে, সেখানেও ডক্সি লো-ব্যান্ডউইথ মোডে চলে। শুধুমাত্র ২জি কানেকশনেও আপনি রোগীর রেকর্ড দেখতে, বিল করতে এবং অ্যাপয়েন্টমেন্ট বুক করতে পারবেন। আমরা বাংলার প্রতিটি প্রান্তের ডাক্তারবাবু যাতে ডিজিটাল প্র্যাকটিসের সুবিধা পান, সেটাই আমাদের লক্ষ্য। ছোট ক্লিনিকের জন্য বিস্তারিত: <Link href="/clinic-software-small-clinic" className="text-blue-600 hover:underline">ছোট ক্লিনিকের সফটওয়্যার</Link> এবং <Link href="/go-paperless-clinic" className="text-blue-600 hover:underline">পেপারলেস ক্লিনিক</Link>।',
        },
      ].map(({ q, a }) => (
        <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 group">
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
            {q}
            <span className="text-blue-500 text-xl group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE ---

export default function BengaliPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <StatsSection />
      <FeaturesSection />
      <WorkflowSection />
      <ResultsSection />
      <WhyBengalSection />
      <FAQSection />
      <SignupCTA
        heading="আপনার ক্লিনিকের জন্য ডিজিটাল সমাধান চান?"
        description="ডক্সি কীভাবে কাজ করে WhatsApp-এ দেখুন — ১৫ মিনিটের ডেমো। বাংলায় জিজ্ঞাসা করুন, বাংলায় বুঝুন।"
        buttonText="WhatsApp এ চ্যাট করুন"
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "বাংলা", url: `${APP_URL}/bn` },
        ]}
      />
    </div>
  );
}
