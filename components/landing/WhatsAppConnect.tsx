import { CheckCircle } from "lucide-react";
import { isWhatsAppEnabled } from "@/lib/feature-flags";

const bullets = [
  {
    title: "Consultation summaries as PDFs",
    desc: "Auto-generate and send visit summaries directly after a consultation.",
  },
  {
    title: "Bills with payment links",
    desc: "Each bill includes a Razorpay link so patients can pay in one tap.",
  },
  {
    title: "Reminders and review requests",
    desc: "Cut no-shows by 80% with clinician-triggered appointment reminders from your number.",
  },
];

export default function WhatsAppConnect() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Send from your own number
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8 max-w-lg">
              Each clinic connects its own WhatsApp Business Account through Facebook
              Embedded Signup. Doxxy sends messages on the clinic&apos;s behalf, from
              the clinic&apos;s verified number. Patients see the clinic&apos;s name, not
              &ldquo;Doxxy.&rdquo; The clinic maintains full control and can disconnect
              at any time.
            </p>

            <ul className="space-y-5 mb-8">
              {bullets.map((b) => (
                <li key={b.title} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-sm text-gray-500">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-400 mb-6 max-w-md">
              Transactional clinical communications only. We do not facilitate the sale,
              dispensing, or commerce of pharmaceutical products, medical devices, or
              supplements. Built to comply with WhatsApp Business Messaging Policy.
            </p>

            {isWhatsAppEnabled && (
              <a
                href="/clinic/whatsapp"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Manage your clinic&apos;s WhatsApp settings &rarr;
              </a>
            )}
          </div>

          {/* Right: Phone mockup */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs bg-gray-50 rounded-[2.5rem] border-4 border-gray-800 p-3 shadow-xl">
              {/* Notch */}
              <div className="w-20 h-5 bg-gray-800 rounded-full mx-auto mb-4" />

              {/* Chat header */}
              <div className="bg-emerald-600 text-white px-3 py-2 rounded-t-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-xs font-bold">
                  K
                </div>
                <div>
                  <p className="text-xs font-semibold">Krishna Clinic</p>
                  <p className="text-[10px] text-emerald-100">WhatsApp Business</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="bg-[#ece5dd] p-3 space-y-3 rounded-b-lg">
                {/* Doxxy note */}
                <p className="text-[10px] text-gray-500 italic px-1">
                  Messages are sent by Doxxy on behalf of Krishna Clinic
                </p>

                {/* Message 1 – appointment confirm */}
                <div className="bg-white rounded-lg p-2 shadow-sm max-w-[85%] ml-auto">
                  <p className="text-[11px] text-gray-900">
                    Your appointment is confirmed for <strong>Mon, 14 Oct at 10:30 AM</strong> with Dr. Sharma.
                  </p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">10:02 AM</p>
                </div>

                {/* Message 2 – PDF consultation summary */}
                <div className="bg-white rounded-lg p-2 shadow-sm max-w-[85%] ml-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M9 12h6M9 16h6" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[11px] font-medium text-gray-900">Consultation_Summary_14Oct.pdf</span>
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">10:03 AM</p>
                </div>

                {/* Message 3 – bill */}
                <div className="bg-white rounded-lg p-2 shadow-sm max-w-[85%] ml-auto">
                  <p className="text-[11px] text-gray-900">
                    Your bill of <strong>₹800</strong> is ready.
                  </p>
                  <p className="text-[10px] text-blue-600 underline mt-0.5">
                    Pay online →
                  </p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">10:03 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
