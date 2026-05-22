import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/917388890554?text=I%27d%20like%20a%20demo%20of%20Doxxy";

export default function PricingAnchor() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          Pay for success,{" "}
          <span className="text-blue-600">not for software.</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-14">
          First 100 appointments are entirely free. After that, it's just ₹10 per
          completed visit. Unlimited doctors, unlimited staff.
        </p>

        <div className="bg-[hsl(40,20%,98%)] dark:bg-gray-800/50 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 mb-10">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 tracking-wide uppercase">
            Clinical Excellence Plan
          </p>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">
              ₹10
            </span>
            <span className="text-xl text-gray-500 dark:text-gray-400">/ visit</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            First 100 appointments free · No monthly subscription · Cancel anytime
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-8">
            Less than what a single no-show costs you. Less than your evening chai. Just ₹10.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-8">
            {[
              "Unlimited doctors & staff",
              "AI-powered clinical notes",
              "WhatsApp reminders & booking",
              "Patient records & prescriptions",
              "Billing & Razorpay collections",
              "Pharmacy inventory management",
              "Multi-clinic dashboard",
              "Free 24-hour data migration",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 text-gray-700 dark:text-gray-200 font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Book a Demo via WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 line-through">Monthly subscriptions</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 line-through">Per-doctor fees</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 line-through">Setup charges</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 line-through">Long-term contracts</span>
          </span>
        </div>
      </div>
    </section>
  );
}
