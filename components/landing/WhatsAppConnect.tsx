import { CheckCircle } from "lucide-react";
import { isWhatsAppEnabled } from "@/lib/feature-flags";

const bullets = [
  {
    title: "Prescriptions as PDFs",
    desc: "Auto-generate and send prescriptions directly after a consultation.",
  },
  {
    title: "Bills with payment links",
    desc: "Each bill includes a Razorpay link so patients can pay in one tap.",
  },
  {
    title: "Reminders and review requests",
    desc: "Cut no-shows by 80% with automated appointment reminders from your number.",
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
              Transactional messages only. We never send marketing or promotional content.
              Built to comply with WhatsApp Business Policy.
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

                {/* Message 2 – PDF prescription */}
                <div className="bg-white rounded-lg p-2 shadow-sm max-w-[85%] ml-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span className="text-[11px] font-medium text-gray-900">Prescription_14Oct.pdf</span>
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
