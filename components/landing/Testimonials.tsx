import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Cardiologist",
    hospital: "Apollo Hospitals, Delhi",
    content:
      "I used to type notes for 2 hours after OPD. Now I speak in Hindi for 30 seconds and walk out. My patients get my full attention, and I get my evenings back.",
  },
  {
    name: "Dr. Rohan Gupta",
    role: "Orthopedic Surgeon",
    hospital: "Fortis Hospital, Mumbai",
    content:
      "With 3 clinics, I was drowning in admin. Doxxy runs the backend while I focus entirely on my patients. I haven't touched a register in 6 months.",
  },
  {
    name: "Anjali Mehta",
    role: "Practice Manager",
    hospital: "Manipal Hospital, Bangalore",
    content:
      "My staff used to spend hours on billing and follow-ups. Now Doxxy does it automatically. We're seeing 8 more patients a day with the same team.",
  },
  {
    name: "Dr. Vikram Singh",
    role: "General Physician",
    hospital: "Max Healthcare, Gurgaon",
    content:
      "I was skeptical about EMRs. But Doxxy is different — it feels like it was built for Indian clinics. My notes, my prescriptions, my schedule — all handled. I just see patients.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[hsl(40,20%,98%)] dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-4">
          Doctors across India are focused on patients,
          <br />
          <span className="text-blue-600">not paperwork.</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-16 max-w-xl mx-auto">
          From solo clinics to multi-specialty hospitals — here&apos;s what happens when Doxxy handles the rest.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 dark:text-gray-200 text-base leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}, {t.hospital}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
