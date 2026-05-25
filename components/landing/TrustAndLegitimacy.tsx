import { Shield, Server, Lock, Clock } from "lucide-react";

const badges = [
  {
    icon: Lock,
    label: "AES-256 Encryption",
    desc: "Encrypted at rest and in transit, always",
  },
  {
    icon: Shield,
    label: "DPDP Act Compliant",
    desc: "Built for India's Digital Personal Data Protection Act",
  },
  {
    icon: Clock,
    label: "99.9% Uptime",
    desc: "Your clinic runs even when the power doesn't",
  },
  {
    icon: Server,
    label: "Role-Based Access",
    desc: "Superadmin, doctor, and staff permissions built in",
  },
];

export default function TrustAndLegitimacy() {
  return (
    <section className="bg-[hsl(40,20%,98%)] py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* A. Compliance badges */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Your data stays yours.{" "}
            <span className="text-blue-600">Always encrypted. Always private.</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="bg-white rounded-xl p-5 border border-gray-200 text-center"
              >
                <badge.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {badge.label}
                </p>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* B. Company info & onboarding promise */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Doxxy is built by{" "}
            <strong>Supersite Technologies Private Limited</strong>, Mumbai, India.
            <br />
            Contact:{" "}
            <a
              href="mailto:prince@supersite.app"
              className="text-blue-600 hover:text-blue-700"
            >
              prince@supersite.app
            </a>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-6">
            <a href="/privacy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a href="/terms" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <span className="text-gray-300">|</span>
            <a href="/about" className="hover:text-blue-600 transition-colors">
              About Us
            </a>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Free 24-hour data migration
            </p>
            <p className="text-sm text-gray-600">
              Switching software shouldn&apos;t require a computer science degree. Our
              India-based team handles everything — export, format, and load your legacy
              data into Doxxy. Your clinic won&apos;t miss a single beat.
            </p>
          </div>
        </div>

        {/* C. Compliance note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          WhatsApp messaging complies with the WhatsApp Business Messaging Policy and Meta Platform Policies.
        </p>
      </div>
    </section>
  );
}
