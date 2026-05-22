import { CheckCircle } from "lucide-react";

const screens = [
  {
    title: "Your schedule, on autopilot",
    description:
      "Appointments confirm themselves. Reminders go out in regional languages. Cancellations fill instantly from the waitlist. You just show up and see patients.",
    features: [
      "Automated SMS & WhatsApp reminders",
      "Real-time conflict detection",
      "Patient self-scheduling portal",
    ],
    visual: (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Today&apos;s Schedule
          </span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { name: "Priya Sharma", time: "10:30 AM", type: "Cardiology Consult", status: "Checked In", color: "green" },
            { name: "Rohan Gupta", time: "11:00 AM", type: "Orthopedic Follow-up", status: "Waiting", color: "amber" },
            { name: "Anjali Mehta", time: "11:30 AM", type: "New Patient", status: "Scheduled", color: "blue" },
          ].map((apt) => (
            <div
              key={apt.name}
              className={`p-3 rounded-lg border ${
                apt.color === "green"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50"
                  : apt.color === "amber"
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-semibold ${
                  apt.color === "green" ? "text-green-800 dark:text-green-200" :
                  apt.color === "amber" ? "text-amber-800 dark:text-amber-200" :
                  "text-blue-800 dark:text-blue-200"
                }`}>
                  {apt.name}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  apt.color === "green" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" :
                  apt.color === "amber" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" :
                  "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                }`}>
                  {apt.status}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${
                apt.color === "green" ? "text-green-600 dark:text-green-400" :
                apt.color === "amber" ? "text-amber-600 dark:text-amber-400" :
                "text-blue-600 dark:text-blue-400"
              }`}>
                {apt.time} — {apt.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Every patient detail, always at your fingertips",
    description:
      "Complete medical history, notes, and prescriptions — searchable in seconds. No more flipping through files while the patient waits.",
    features: [
      "Searchable medical timeline",
      "Prescription history & alerts",
      "One-click PDF export",
    ],
    visual: (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Patient: Vikram Singh
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">
            Active
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">Age</span>
              <p className="font-semibold text-gray-900 dark:text-white">42</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">Gender</span>
              <p className="font-semibold text-gray-900 dark:text-white">Male</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">Phone</span>
              <p className="font-semibold text-gray-900 dark:text-white">+91 98XXXXXX01</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">Last Visit</span>
              <p className="font-semibold text-gray-900 dark:text-white">12/06/2025</p>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-xs font-semibold text-gray-900 dark:text-white mb-2 block">
              Recent Consultations
            </span>
            <div className="space-y-2">
              <div className="text-xs p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">Fever & cough</p>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Prescribed Paracetamol 500mg</p>
              </div>
              <div className="text-xs p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-gray-200">Annual checkup</p>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">BP 120/80, all vitals normal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Your clinic at a glance — no spreadsheets needed",
    description:
      "Real-time metrics on patient flow, revenue, and appointments. Know exactly how your clinic is doing without asking anyone or opening Excel.",
    features: [
      "Real-time practice metrics & KPIs",
      "Visual charts for revenue trends",
      "Role-based views for staff",
    ],
    visual: (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Clinic Overview
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-100 dark:border-blue-800/30">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Appointments</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">32</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-100 dark:border-green-800/30">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Today&apos;s Revenue</span>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹45,000</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center border border-amber-100 dark:border-amber-800/30">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Pending</span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">4</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-100 dark:border-green-800/30">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Completed</span>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">28</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-end gap-2 h-16">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Bills that send themselves",
    description:
      "Consultation ends. Invoice generates. Razorpay link goes to the patient's WhatsApp. The money hits your account before they leave the lobby. You do nothing.",
    features: [
      "Auto-generate invoices",
      "Payment tracking & alerts",
      "Razorpay integration via WhatsApp",
    ],
    visual: (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Invoice #INV-0042
          </span>
        </div>
        <div className="p-4">
          <div className="text-sm space-y-2.5 text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Consultation</span>
              <span className="font-medium text-gray-900 dark:text-white">₹800.00</span>
            </div>
            <div className="flex justify-between">
              <span>ECG</span>
              <span className="font-medium text-gray-900 dark:text-white">₹500.00</span>
            </div>
            <div className="flex justify-between">
              <span>Lab Test — CBC</span>
              <span className="font-medium text-gray-900 dark:text-white">₹700.00</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between font-bold text-base">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-blue-600 dark:text-blue-400">₹2,000.00</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium text-center py-2 rounded-lg border border-green-200 dark:border-green-800/50">
              Razorpay link sent
            </div>
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium text-center py-2 rounded-lg border border-blue-200 dark:border-blue-800/50">
              Download PDF
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function ProductShowcase() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-4">
          Here&apos;s what your clinic looks like on Doxxy.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-16 max-w-xl mx-auto">
          Everything you need, running quietly in the background while you see patients.
        </p>

        <div className="space-y-20">
          {screens.map((screen, i) => (
            <div
              key={screen.title}
              className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                i % 2 === 1 ? "" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {screen.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {screen.description}
                </p>
                <div className="space-y-3">
                  {screen.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                {screen.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
