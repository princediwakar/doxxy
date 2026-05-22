import { Mic, ReceiptText, Package, MessageCircle } from "lucide-react";

const outcomes = [
  {
    icon: Mic,
    accent: "text-red-500",
    bgAccent: "bg-red-100 dark:bg-red-900/30",
    borderAccent: "border-red-200 dark:border-red-900/50",
    kicker: "Voice Dictation",
    headline: "Your notes write themselves.",
    body: "Speak for 30 seconds in Hindi, English, or Tamil. Doxxy writes a perfect SOAP note. No typing. No dictation service. You walk out at 6pm.",
    stat: "Avg. 90 minutes saved per doctor per day",
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Recording — Hindi</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs space-y-1.5 border border-gray-200 dark:border-gray-700">
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full" />
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-xs border border-green-200 dark:border-green-900/50">
          <p className="font-semibold text-green-800 dark:text-green-200 text-[11px] mb-1">SOAP Note Generated</p>
          <p className="text-[10px] text-green-700 dark:text-green-300 leading-relaxed">
            <strong>S:</strong> Patient reports frontal headache × 3 days, aggravated by screen use.<br />
            <strong>O:</strong> BP 120/80, HR 72. No neurological deficits noted.<br />
            <strong>A:</strong> Tension-type headache.<br />
            <strong>P:</strong> Naproxen 250mg BD × 5 days. Review in 2 weeks.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: ReceiptText,
    accent: "text-blue-500",
    bgAccent: "bg-blue-100 dark:bg-blue-900/30",
    borderAccent: "border-blue-200 dark:border-blue-900/50",
    kicker: "Auto-Billing",
    headline: "Your bills send themselves.",
    body: "Consultation ends. Invoice generates. Razorpay link arrives on the patient's WhatsApp. The money hits your account before they leave the lobby.",
    stat: "Avg. ₹12,000/month recovered from forgotten bills",
    visual: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-200">Invoice #INV-0147</span>
          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">Awaiting Payment</span>
        </div>
        <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
          <div className="flex justify-between"><span>Consultation — Dr. Priya</span><span className="font-medium">₹800</span></div>
          <div className="flex justify-between"><span>ECG</span><span className="font-medium">₹500</span></div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 flex justify-between font-bold text-sm">
            <span>Total</span><span className="text-blue-600">₹1,300</span>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 text-[10px] text-blue-700 dark:text-blue-300 p-2 rounded-lg border border-blue-200 dark:border-blue-900/50 text-center font-medium">
          Razorpay payment link sent via WhatsApp
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    accent: "text-green-600",
    bgAccent: "bg-green-100 dark:bg-green-900/30",
    borderAccent: "border-green-200 dark:border-green-900/50",
    kicker: "Smart Scheduling",
    headline: "Your schedule manages itself.",
    body: "Appointments auto-confirmed. Reminders sent in regional languages. Cancellations instantly fill from the waitlist. Zero empty slots. Zero no-shows.",
    stat: "Avg. 80% reduction in no-shows",
    visual: (
      <div className="space-y-2">
        <div className="bg-green-700 text-white text-xs p-3 rounded-2xl rounded-bl-sm max-w-[88%] ml-auto">
          <p className="font-medium mb-0.5 text-[11px]">Appointment Confirmed ✓</p>
          <p className="text-[11px] leading-relaxed opacity-90">
            <strong>Mr. Sharma</strong>, your cardiology consult is confirmed for <strong>Tomorrow 10:30 AM</strong>.
          </p>
          <p className="text-[10px] opacity-70 mt-1">10:15 AM ✓✓</p>
        </div>
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs p-2.5 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] mb-1">Waitlist auto-notified</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100 text-[11px]">Riya Patel</p>
              <p className="text-[10px] text-gray-500">Position #1 — notified</p>
            </div>
            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] font-medium px-2 py-0.5 rounded-full">Slot offered</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Package,
    accent: "text-amber-600",
    bgAccent: "bg-amber-100 dark:bg-amber-900/30",
    borderAccent: "border-amber-200 dark:border-amber-900/50",
    kicker: "AI Inventory",
    headline: "Your inventory tracks itself.",
    body: "Snap a photo of your supplier bill. Doxxy reads it, updates stock levels, and warns you before fast-moving medicines run out. No manual entry. No stockouts.",
    stat: "Avg. ₹8,000/month saved in emergency restocking",
    visual: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-200">Inventory Alert</span>
          <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">Low Stock</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-1.5 px-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30">
            <span className="font-medium text-gray-800 dark:text-gray-100">Paracetamol 500mg</span>
            <span className="text-red-600 font-bold">2 strips left</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-900/30">
            <span className="font-medium text-gray-800 dark:text-gray-100">Amoxicillin 250mg</span>
            <span className="text-yellow-600 font-bold">12 strips left</span>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 text-[10px] text-amber-700 dark:text-amber-300 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
          Upload supplier bill → auto-update stock levels
        </div>
      </div>
    ),
  },
];

export default function OutcomeGrid() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-4">
          While you&apos;re with a patient,
          <br />
          <span className="text-blue-600">here&apos;s what Doxxy is doing.</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-16 max-w-xl mx-auto">
          No clicking. No typing. No chasing. Everything happens automatically.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {outcomes.map((item) => (
            <div
              key={item.kicker}
              className="bg-[hsl(40,20%,98%)] dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col sm:flex-row gap-6"
            >
              <div className="sm:w-48 shrink-0">
                <div className={`${item.borderAccent} border rounded-xl p-4 bg-white dark:bg-gray-800`}>
                  {item.visual}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${item.bgAccent} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`h-4 w-4 ${item.accent}`} />
                  </div>
                  <span className={`text-xs font-semibold tracking-wide uppercase ${item.accent}`}>
                    {item.kicker}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.headline}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {item.body}
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 inline-block px-3 py-1 rounded-full">
                  {item.stat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
