import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/917388890554?text=I%27d%20like%20a%20demo%20of%20Doxxy";

export default function HeroRevenue() {
  return (
    <section className="relative overflow-hidden bg-[hsl(40,24%,97%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <CheckCircle className="h-4 w-4" />
              Trusted by 500+ clinics across India
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-gray-900 mb-6">
              Focus on your patients.
              <br />
              <span className="text-blue-600">We&apos;ll handle the rest.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Doxxy automates clinical notes, billing, scheduling, and inventory —
              and delivers prescriptions, bills, and reminders through your
              clinic&apos;s own WhatsApp number. You see patients. Everything else
              runs itself.{" "}
              <Link href="/pricing" className="text-blue-600 underline underline-offset-2 hover:text-blue-700 font-medium">
                Just ₹10 per consultation.
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-blue-600/25"
              >
                Start with 100 Free Appointments
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book a Demo via WhatsApp
              </a>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="italic">
                &ldquo;I&apos;m home by 6:30 now.&rdquo; — Dr. Priya, Pune
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="italic hidden sm:inline">
                &ldquo;Zero no-shows this month.&rdquo; — Dr. Mehta, Mumbai
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="italic hidden sm:inline">
                &ldquo;My notes write themselves.&rdquo; — Dr. Reddy, Hyderabad
              </span>
            </div>
          </div>

          {/* Right: Product flow visual */}
          <div className="hidden lg:flex flex-col items-center gap-0">
            {/* Step 1: Dictation phone mockup */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 w-full max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Recording — Hindi
                  </p>
                  <p className="text-xs text-gray-500">Tap to stop</p>
                </div>
              </div>
              <div className="flex items-end gap-0.5 h-8">
                {[3, 6, 4, 8, 5, 7, 4, 6, 5, 8, 6, 7, 4, 6, 5, 8, 6, 7, 4, 6, 5, 3, 4, 6].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-red-400"
                      style={{ height: `${(h / 8) * 100}%` }}
                    />
                  )
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                &ldquo;Patient reports frontal headache × 3 days...&rdquo;
              </p>
            </div>

            {/* Connector */}
            <div className="flex flex-col items-center py-1">
              <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-blue-400" />
              <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full -my-0.5 relative z-10">
                Doxxy
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-blue-400 to-gray-300" />
            </div>

            {/* Step 2: Results — three check cards */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 w-full max-w-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    SOAP note written
                  </p>
                  <p className="text-xs text-gray-500">
                    Saved to patient record
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Bill sent via WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">₹800 — awaiting payment</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Inventory updated
                  </p>
                  <p className="text-xs text-gray-500">Stock levels synced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fade transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white dark:to-gray-900"
        aria-hidden="true"
      />
    </section>
  );
}
