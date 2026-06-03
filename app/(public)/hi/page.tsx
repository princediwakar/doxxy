// Path: app/(public)/hi/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, CreditCard, FileText, Calendar, Users, BarChart3 } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'क्लिनिक मैनेजमेंट सॉफ्टवेयर — डॉक्सी | अपॉइंटमेंट, बिलिंग, मरीज रिकॉर्ड',
  description: 'डॉक्सी भारत का भरोसेमंद क्लिनिक मैनेजमेंट सॉफ्टवेयर है। अपॉइंटमेंट बुकिंग, डिजिटल बिलिंग, GST, मरीज़ रिकॉर्ड, WhatsApp रिमाइंडर — सब एक प्लेटफ़ॉर्म पर। लखनऊ, जयपुर, पटना, इंदौर सहित 500+ क्लिनिक्स का भरोसा।',
  alternates: {
    canonical: '/hi',
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
    title: 'क्लिनिक मैनेजमेंट सॉफ्टवेयर — डॉक्सी | अपॉइंटमेंट, बिलिंग, मरीज रिकॉर्ड',
    description: 'डॉक्सी भारत का भरोसेमंद क्लिनिक मैनेजमेंट सॉफ्टवेयर है। अपॉइंटमेंट बुकिंग, डिजिटल बिलिंग, GST, मरीज़ रिकॉर्ड, WhatsApp रिमाइंडर — सब एक प्लेटफ़ॉर्म पर।',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'डॉक्सी — क्लिनिक मैनेजमेंट सॉफ्टवेयर' }],
  },
  keywords: ['क्लिनिक मैनेजमेंट सॉफ्टवेयर', 'डॉक्टर के लिए सॉफ्टवेयर', 'क्लिनिक अपॉइंटमेंट सिस्टम', 'मरीज रिकॉर्ड सॉफ्टवेयर', 'क्लिनिक बिलिंग सॉफ्टवेयर', 'डॉक्सी'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'क्या डॉक्सी छोटी क्लिनिक के लिए सही है? मेरी क्लिनिक में सिर्फ मैं ही डॉक्टर हूँ।',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'बिल्कुल सही है। डॉक्सी खासतौर पर सिंगल-डॉक्टर क्लिनिक और छोटी OPD के लिए डिज़ाइन किया गया है। लखनऊ, जयपुर, पटना, इंदौर जैसे शहरों में 500 से ज़्यादा छोटी क्लिनिक्स डॉक्सी इस्तेमाल कर रही हैं। आपको बस एक स्मार्टफोन या लैपटॉप चाहिए। कोडिंग या टेक्निकल नॉलेज की ज़रूरत नहीं। हमारा प्रैक्टिस एसेंशियल्स प्लान बिल्कुल मुफ्त है — ताकि आप बिना किसी रिस्क के शुरुआत कर सकें।',
      },
    },
    {
      '@type': 'Question',
      name: 'डॉक्सी का खर्चा कितना आता है? क्या यह छोटी क्लिनिक के बजट में आएगा?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'डॉक्सी का प्रैक्टिस एसेंशियल्स प्लान बिल्कुल मुफ्त है — कोई क्रेडिट कार्ड नहीं चाहिए। जब आपको लगे कि डॉक्सी आपकी क्लिनिक के लिए फायदेमंद है, तब क्लिनिकल एक्सीलेंस प्लान सिर्फ ₹10 प्रति कंसल्टेशन की दर से शुरू होता है। यानी अगर आप दिन में 20 मरीज़ देखते हैं, तो पूरे महीने का खर्च लगभग ₹3,000-₹3,500 होगा। और एक नो-शो मरीज़ को बचाने पर ही ₹300-₹1,000 की बचत होती है। मतलब, डॉक्सी महीने के 3-4 नो-शो रोककर अपना खर्चा खुद निकाल लेता है।',
      },
    },
    {
      '@type': 'Question',
      name: 'क्या डॉक्सी हिंदी में काम करता है? मुझे अंग्रेज़ी समझने में दिक्कत होती है।',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'जी हाँ, डॉक्सी पूरी तरह हिंदी में उपलब्ध है। हम समझते हैं कि भारत के ज़्यादातर डॉक्टर हिंदी में ज़्यादा सहज हैं — खासकर टियर-2 और टियर-3 शहरों में। डॉक्सी का पूरा इंटरफेस हिंदी में बदला जा सकता है। सिर्फ इतना ही नहीं — WhatsApp रिमाइंडर भी हिंदी में भेजे जा सकते हैं, और प्रिस्क्रिप्शन भी हिंदी में प्रिंट हो सकते हैं। हमारी सपोर्ट टीम भी हिंदी में बात करती है। तो भाषा को लेकर बिल्कुल चिंता मत कीजिए।',
      },
    },
    {
      '@type': 'Question',
      name: 'डॉक्सी चलाना सीखना कितना मुश्किल है? मैंने कभी क्लिनिक सॉफ्टवेयर इस्तेमाल नहीं किया।',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'डॉक्सी को इसी सोच के साथ बनाया गया है कि इसे कोई भी चला सके — चाहे उन्होंने पहले कभी कोई डिजिटल टूल इस्तेमाल न किया हो। इंटरफेस बिल्कुल सिंपल है — ठीक वैसे ही जैसे आप WhatsApp या YouTube चलाते हैं। ज़्यादातर क्लिनिक्स 2-3 दिन में पूरी तरह अभ्यस्त हो जाते हैं। हम फ्री ट्रेनिंग सेशन भी देते हैं — हिंदी में — जिसमें हमारी टीम आपको और आपके स्टाफ को सब कुछ सिखा देती है। और हाँ, 24x7 सपोर्ट हमेशा उपलब्ध है।',
      },
    },
    {
      '@type': 'Question',
      name: 'क्या मेरे मरीज़ों का डेटा डॉक्सी पर सुरक्षित रहेगा? मेडिकल रिकॉर्ड बहुत संवेदनशील होते हैं।',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'डेटा सिक्योरिटी हमारी सबसे बड़ी प्राथमिकता है। डॉक्सी एंड-टू-एंड एन्क्रिप्शन का इस्तेमाल करता है — ठीक वैसे ही जैसे बैंकिंग ऐप्स करते हैं। आपका सारा डेटा भारत में ही स्टोर होता है, किसी विदेशी सर्वर पर नहीं। हम HIPAA और India के डेटा प्रोटेक्शन कानूनों का पूरी तरह पालन करते हैं। आपके मरीज़ों का डेटा सिर्फ आप देख सकते हैं — और सिर्फ वही स्टाफ जिन्हें आप एक्सेस दें। हम किसी भी तीसरे पक्ष को डेटा नहीं बेचते। मेडिकल डेटा की गोपनीयता को लेकर हम बिल्कुल गंभीर हैं।',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      क्लिनिक का पूरा मैनेजमेंट — अब एक स्क्रीन पर।
    </h1>
    <SectionSubtitle>
      डॉक्सी भारत का भरोसेमंद क्लिनिक मैनेजमेंट सॉफ्टवेयर है। लखनऊ, जयपुर, पटना, इंदौर और पूरे उत्तर भारत की 500+ क्लिनिक्स अपॉइंटमेंट बुकिंग, डिजिटल बिलिंग, GST, मरीज़ रिकॉर्ड और WhatsApp रिमाइंडर के लिए डॉक्सी पर भरोसा करती हैं।
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">मुफ़्त शुरू करें <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>कागज़ पर चलने वाली क्लिनिक की असली कीमत</SectionTitle>
    <SectionSubtitle className="mt-4">
      यह समस्या सिर्फ आपकी नहीं है — लखनऊ से लेकर पटना तक, हर शहर की क्लिनिक यही झेल रही है।
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        कल्पना कीजिए: सुबह के 9 बजे, लखनऊ के गोमती नगर में आपकी क्लिनिक खुलती है। रिसेप्शन पर बैठी प्रिया के सामने OPD रजिस्टर खुला है। 35 मरीज़ों की अपॉइंटमेंट बुक है — आज का दिन अच्छा जाएगा।
      </p>
      <p>
        11 बजते-बजते 7 मरीज़ बिना बताए गायब हैं। प्रिया ने फ़ोन लगाए — दो नंबर बंद थे, एक ने कॉल नहीं उठाया। आपकी कंसल्टेशन रूम खाली पड़ी है, जबकि बाहर 6 वॉक-इन मरीज़ बेसब्री से इंतज़ार कर रहे हैं — जिन्हें वही स्लॉट मिल सकते थे, अगर किसी को पता होता कि वो 7 मरीज़ आने वाले नहीं थे।
      </p>
      <p>
        यह कहानी सिर्फ लखनऊ की नहीं है। जयपुर, पटना, इंदौर, भोपाल — टियर-2 और टियर-3 के हर शहर की क्लिनिक में यही होता है। कागज़ के रजिस्टर में लिखी अपॉइंटमेंट। हाथ से बनाए बिल — जिनमें GST का हिसाब गलत होना आम बात है। कहीं रखी प्रिस्क्रिप्शन पर्चियाँ। और हर शाम, रिसेप्शनिस्ट का वो एक घंटा जो सिर्फ हिसाब मिलाने में चला जाता है।
      </p>
      <p>
        एक आम भारतीय क्लिनिक हर दिन 8-15 बुक्ड अपॉइंटमेंट नो-शो की वजह से खो देती है। हर खाली स्लॉट का मतलब सिर्फ ₹300-₹1,000 की कंसल्टेशन फीस नहीं खोना — बल्कि उसके साथ जुड़ी फॉलो-अप विज़िट, फार्मेसी रेफरल, और डायग्नोस्टिक टेस्ट की पूरी चेन खोना है। एक सिंगल-डॉक्टर क्लिनिक के लिए, यह ₹90,000 से ₹1,80,000 सालाना का नुकसान है। ऊपर से, कागज़ी सिस्टम की वजह से बिलिंग में हर महीने 5-10 गलतियाँ, जो ऑडिट और टैक्स फाइलिंग के वक्त सिरदर्द बनती हैं।
      </p>
      <p>
        यह कोई स्टाफ की कमी की समस्या नहीं है। यह कोई मरीज़ों की वफादारी की समस्या नहीं है। यह एक सिस्टम की समस्या है — और इसका हल सिर्फ एक क्लिक दूर है।
      </p>
    </div>
  </Section>
);

const FeaturesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>डॉक्सी आपकी क्लिनिक के लिए क्या करता है</SectionTitle>
    <SectionSubtitle className="mt-4">
      छह शक्तिशाली फीचर्स जो आपकी क्लिनिक के हर पहलू को आसान और सटीक बनाते हैं।
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        {
          icon: Bell,
          title: 'WhatsApp अपॉइंटमेंट रिमाइंडर',
          description: 'मरीज़ों को अपॉइंटमेंट से 24 घंटे पहले WhatsApp पर ऑटोमैटिक रिमाइंडर भेजें। मरीज़ एक टैप से कन्फर्म या रिशेड्यूल कर सकते हैं। जो स्लॉट खाली हो, वो वेटिंग लिस्ट वालों को ऑटोमैटिक ऑफर हो जाता है। रिज़ल्ट: नो-शो में 35% तक की कमी।',
        },
        {
          icon: CreditCard,
          title: 'डिजिटल बिलिंग और GST',
          description: 'हर कंसल्टेशन का बिल अपने आप बनता है। GST कैलकुलेशन ऑटोमैटिक — HSN कोड के साथ। UPI, कार्ड, कैश — हर पेमेंट मोड का हिसाब एक जगह। महीने के आखिर में एक क्लिक में GST रिपोर्ट तैयार। चार्टर्ड अकाउंटेंट का इंतज़ार खत्म।',
        },
        {
          icon: FileText,
          title: 'मरीज़ का पूरा रिकॉर्ड (EMR)',
          description: 'हर मरीज़ की पूरी मेडिकल हिस्ट्री — पिछली विज़िट्स, प्रिस्क्रिप्शन, लैब रिपोर्ट, एलर्जी — सब कुछ सेकंडों में सर्च करें। अब कागज़ की फ़ाइलों के ढेर में पिछले महीने की पर्ची ढूँढने की ज़रूरत नहीं। मरीज़ का नाम टाइप करें, पूरा रिकॉर्ड सामने।',
        },
        {
          icon: Calendar,
          title: 'ऑनलाइन अपॉइंटमेंट बुकिंग',
          description: 'मरीज़ खुद अपनी सुविधा से ऑनलाइन अपॉइंटमेंट बुक करें — आपकी वेबसाइट, Google, या WhatsApp से। 24x7 बुकिंग खुली रहती है। आपकी रिसेप्शनिस्ट को हर बुकिंग के लिए फ़ोन उठाने की ज़रूरत नहीं। स्लॉट मैनेजमेंट पूरी तरह ऑटोमैटिक।',
        },
        {
          icon: Users,
          title: 'कतार प्रबंधन (Queue Management)',
          description: 'वेटिंग एरिया में मरीज़ों की भीड़ और अफरा-तफरी खत्म। टोकन सिस्टम, लाइव वेटिंग टाइम, और ऑटोमैटिक कतार अपडेट। मरीज़ को पता रहता है कि उनकी बारी कब आएगी। स्टाफ को बार-बार यही नहीं बताना पड़ता कि "आपका नंबर आने वाला है"।',
        },
        {
          icon: BarChart3,
          title: 'एनालिटिक्स डैशबोर्ड',
          description: 'रोज़ कितने मरीज़ आए, कितनी कमाई हुई, कौन सी सर्विस सबसे ज़्यादा चली, मरीज़ों का रिटेंशन रेट — सब कुछ एक नज़र में। बिना किसी एकाउंटेंट के, बिना किसी एक्सेल शीट के। अपनी क्लिनिक की ग्रोथ की पूरी तस्वीर, रियल टाइम में।',
        },
      ].map(({ icon: Icon, title, description }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section>
    <SectionTitle>डॉक्सी शुरू करना कितना आसान है</SectionTitle>
    <SectionSubtitle className="mt-4">
      चार स्टेप्स में आपकी क्लिनिक पूरी तरह डिजिटल हो जाएगी। कोई टेक्निकल नॉलेज नहीं चाहिए।
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '1', title: 'फ्री अकाउंट बनाएँ', description: 'दो मिनट में साइन अप करें। बस अपना नाम, क्लिनिक का नाम और मोबाइल नंबर डालें। कोई क्रेडिट कार्ड नहीं चाहिए। कोई छुपा हुआ चार्ज नहीं।' },
        { step: '2', title: 'मरीज़ और स्टाफ जोड़ें', description: 'अपने मौजूदा मरीज़ों का डेटा अपलोड करें — एक्सेल शीट से बल्क अपलोड का ऑप्शन है। स्टाफ मेंबर्स को उनकी भूमिका के हिसाब से एक्सेस दें।' },
        { step: '3', title: 'क्लिनिक मैनेज करना शुरू करें', description: 'अपॉइंटमेंट बुक करें, डिजिटल बिल बनाएँ, प्रिस्क्रिप्शन लिखें — सब कुछ डिजिटल। आपका रिसेप्शन डेस्क अब सिर्फ एक स्क्रीन है।' },
        { step: '4', title: 'प्रैक्टिस बढ़ाएँ', description: 'एनालिटिक्स डैशबोर्ड देखें, मरीज़ों का फीडबैक लें, WhatsApp कैंपेन भेजें — और अपनी प्रैक्टिस को नई ऊँचाइयों पर ले जाएँ।' },
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
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>डॉक्सी से पहले और बाद में — आपकी क्लिनिक का बदलाव</SectionTitle>
    <SectionSubtitle className="mt-4">
      यह किसी और कंपनी से तुलना नहीं है। यह आपकी अपनी क्लिनिक की स्थिति है — कागज़ पर और डॉक्सी पर।
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">पैमाना</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">कागज़ पर</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">डॉक्सी के साथ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'मरीज़ का इंतज़ार का समय', before: '30-45 मिनट, पीक आवर्स में 1 घंटा', after: '10-15 मिनट — डिजिटल कतार प्रबंधन से' },
            { metric: 'अपॉइंटमेंट नो-शो', before: '20-30% मरीज़ बिना बताए नहीं आते', after: '10-15% — WhatsApp रिमाइंडर से 35% कमी' },
            { metric: 'बिलिंग में गलतियाँ', before: 'हर महीने 5-10 गलतियाँ, GST का गलत हिसाब', after: 'ऑटोमैटिक बिलिंग, शून्य गलतियाँ, GST रेडी' },
            { metric: 'रिसेप्शन का समय', before: '2-3 घंटे रोज़ सिर्फ रजिस्टर और बिलिंग में', after: 'शून्य — पूरी तरह ऑटोमेटेड' },
            { metric: 'GST और टैक्स फाइलिंग', before: 'CA का इंतज़ार, महीने का हिसाब मैन्युअल', after: 'एक क्लिक में रिपोर्ट तैयार, हर पल का हिसाब' },
            { metric: 'मरीज़ की वापसी दर', before: '50-60% मरीज़ ही दोबारा आते हैं', after: '75-85% — रिमाइंडर, बेहतर अनुभव और विश्वास से' },
            { metric: 'रोज़ की कमाई की जानकारी', before: 'डायरी में लिखो, महीने के आखिर में जोड़ो', after: 'रियल-टाइम डैशबोर्ड — हर रुपये का हिसाब' },
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

const FAQSection = () => (
  <Section>
    <SectionTitle>अक्सर पूछे जाने वाले सवाल</SectionTitle>
    <SectionSubtitle className="mt-4">
      हर वो सवाल जो डॉक्टर डॉक्सी शुरू करने से पहले पूछते हैं।
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'क्या डॉक्सी छोटी क्लिनिक के लिए सही है? मेरी क्लिनिक में सिर्फ मैं ही डॉक्टर हूँ।',
          a: 'बिल्कुल सही है। डॉक्सी खासतौर पर सिंगल-डॉक्टर क्लिनिक और छोटी OPD के लिए डिज़ाइन किया गया है। लखनऊ, जयपुर, पटना, इंदौर, भोपाल जैसे शहरों में 500 से ज़्यादा छोटी क्लिनिक्स डॉक्सी इस्तेमाल कर रही हैं — और इनमें से ज़्यादातर सिंगल-डॉक्टर सेटअप हैं। आपको बस एक स्मार्टफोन या लैपटॉप चाहिए। हमारा प्रैक्टिस एसेंशियल्स प्लान बिल्कुल मुफ्त है, ताकि आप बिना किसी रिस्क के शुरुआत कर सकें। जब डॉक्सी आपकी क्लिनिक का अहम हिस्सा बन जाए, तब प्रीमियम प्लान पर अपग्रेड करें।',
        },
        {
          q: 'डॉक्सी का खर्चा कितना है? मैंने सुना है ऐसे सॉफ्टवेयर बहुत महँगे होते हैं।',
          a: 'डॉक्सी का प्रैक्टिस एसेंशियल्स प्लान बिल्कुल मुफ्त है। जब आपको लगे कि डॉक्सी आपकी क्लिनिक के लिए फायदेमंद है, तब क्लिनिकल एक्सीलेंस प्लान सिर्फ ₹10 प्रति कंसल्टेशन से शुरू होता है। अगर आप दिन में 20 मरीज़ देखते हैं, तो पूरे महीने का खर्च करीब ₹3,000-₹3,500 बैठता है। अब सोचिए — एक भी नो-शो मरीज़ को रोकने पर आप ₹300-₹1,000 बचाते हैं। मतलब महीने में सिर्फ 3-4 नो-शो रोककर डॉक्सी अपना पूरा खर्च निकाल लेता है। बाकी सब — <Link href="/clinic-billing-software" className="text-blue-600 hover:underline">डिजिटल बिलिंग</Link>, <Link href="/whatsapp-appointment-reminders" className="text-blue-600 hover:underline">WhatsApp रिमाइंडर</Link>, <Link href="/electronic-medical-records" className="text-blue-600 hover:underline">मरीज़ रिकॉर्ड</Link> — आपको मुफ्त मिल रहे हैं।',
        },
        {
          q: 'क्या डॉक्सी हिंदी में काम करता है? मुझे अंग्रेज़ी समझने में दिक्कत होती है।',
          a: 'जी हाँ, और सिर्फ इंटरफेस ही नहीं — पूरा अनुभव। डॉक्सी का पूरा डैशबोर्ड हिंदी में बदला जा सकता है। WhatsApp रिमाइंडर हिंदी में जाते हैं। प्रिस्क्रिप्शन हिंदी में प्रिंट हो सकते हैं। हमारी सपोर्ट टीम हिंदी में बात करती है — फ़ोन पर, WhatsApp पर, हर जगह। हम समझते हैं कि भारत के ज़्यादातर डॉक्टर — खासकर टियर-2 और टियर-3 शहरों में — हिंदी में ज़्यादा सहज हैं। भाषा कभी बाधा नहीं बननी चाहिए, और डॉक्सी पर ऐसा नहीं होगा।',
        },
        {
          q: 'मैंने कभी क्लिनिक सॉफ्टवेयर नहीं चलाया। सीखना कितना मुश्किल होगा?',
          a: 'डॉक्सी इसी सोच के साथ बनाया गया है कि इसे कोई भी चला सके — फिर चाहे उन्होंने ज़िंदगी में कभी कोई डिजिटल टूल इस्तेमाल न किया हो। इंटरफेस बिल्कुल सिंपल है — ठीक वैसे जैसे WhatsApp या YouTube चलाते हैं। बड़े-बड़े बटन, साफ-साफ लेबल, कोई कन्फ्यूज़न नहीं। ज़्यादातर क्लिनिक्स 2-3 दिनों में पूरी तरह अभ्यस्त हो जाती हैं। हम फ्री ट्रेनिंग सेशन भी देते हैं — हिंदी में — जिसमें हमारी टीम आपको और आपके स्टाफ को एक-एक फीचर समझाती है। और 24x7 सपोर्ट हमेशा आपके साथ है। अगर कभी कुछ समझ न आए, बस हमें WhatsApp करें।',
        },
        {
          q: 'मेरे मरीज़ों का मेडिकल डेटा कितना सुरक्षित है? कहीं लीक तो नहीं होगा?',
          a: 'डेटा सिक्योरिटी हमारी सबसे बड़ी प्राथमिकता है — और हम इस पर कोई समझौता नहीं करते। डॉक्सी एंड-टू-एंड एन्क्रिप्शन का इस्तेमाल करता है, ठीक वैसे ही जैसे आपकी बैंकिंग ऐप करती है। आपका सारा डेटा भारत में स्थित सर्वर्स पर स्टोर होता है। हम HIPAA और भारत के डेटा प्रोटेक्शन कानूनों का पूरी तरह पालन करते हैं। आपके मरीज़ों का डेटा सिर्फ आप और वही स्टाफ देख सकते हैं जिन्हें आप एक्सेस देंगे। हम न तो किसी तीसरे पक्ष को डेटा बेचते हैं, न ही विज्ञापन के लिए इस्तेमाल करते हैं। मेडिकल डेटा की गोपनीयता को लेकर हम बिल्कुल गंभीर हैं — क्योंकि हम जानते हैं कि एक डॉक्टर और मरीज़ के बीच का भरोसा सबसे कीमती चीज़ है। <Link href="/clinic-data-security-guide" className="text-blue-600 hover:underline">डेटा सुरक्षा के बारे में विस्तार से पढ़ें</Link>।',
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

export default function HindiPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <WorkflowSection />
      <ResultsSection />
      <FAQSection />
      <SignupCTA
        heading="अपने क्लिनिक के लिए डिजिटल सॉल्यूशन चाहिए?"
        description="डॉक्सी कैसे काम करता है WhatsApp पर देखें — 15 मिनट का डेमो। हिंदी में पूछें, हिंदी में समझें।"
        buttonText="WhatsApp पर चैट करें"
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "हिंदी", url: `${APP_URL}/hi` },
        ]}
      />
    </div>
  );
}
