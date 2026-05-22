import { Shield, Server, Lock, Clock } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "HIPAA Compliant",
    desc: "Patient data protected to US healthcare standards",
  },
  {
    icon: Server,
    label: "SOC 2 Type 2 Certified",
    desc: "Independently audited security controls",
  },
  {
    icon: Clock,
    label: "99.9% Uptime SLA",
    desc: "Your clinic runs even when the power doesn't",
  },
  {
    icon: Lock,
    label: "AES-256 Encryption",
    desc: "Bank-grade encryption at rest and in transit",
  },
];

export default function FrictionKiller() {
  return (
    <section className="bg-[hsl(40,20%,98%)] dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          We move your data in 24 hours.{" "}
          <span className="text-blue-600">So you can focus on patients from day one.</span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          Switching software shouldn't require a computer science degree. Our Free
          Concierge Onboarding team will export your legacy data, format it, and
          load it into Doxxy. Your clinic won't miss a single beat.
        </p>

        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex -space-x-2">
            {["#FFD700", "#C0C0C0", "#CD7F32", "#4A90D9"].map((color) => (
              <div
                key={color}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {color === "#FFD700" ? "RS" : color === "#C0C0C0" ? "PK" : color === "#CD7F32" ? "AM" : "DS"}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-200">Rahul, Priya, Ankit & Deepa</strong>
            <br />Your India-based onboarding team
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center"
            >
              <badge.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {badge.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
