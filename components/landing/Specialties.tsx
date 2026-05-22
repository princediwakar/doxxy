import {
  Heart,
  Brain,
  Eye,
  Scissors,
  Bone,
  Smile,
  Stethoscope,
  Ear,
} from "lucide-react";

const specialties = [
  { icon: Heart, name: "Cardiology", desc: "Heart & vascular" },
  { icon: Brain, name: "Neurology", desc: "Brain & nervous system" },
  { icon: Eye, name: "Ophthalmology", desc: "Comprehensive eye care" },
  { icon: Scissors, name: "Dermatology", desc: "Skin & aesthetic care" },
  { icon: Bone, name: "Orthopedics", desc: "Bone & musculoskeletal" },
  { icon: Smile, name: "Dental", desc: "Oral health & hygiene" },
  { icon: Stethoscope, name: "Pulmonology", desc: "Lungs & respiratory" },
  { icon: Ear, name: "ENT", desc: "Ear, nose & throat" },
];

export default function Specialties() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-4">
          Built for every specialty.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-16 max-w-xl mx-auto">
          Flexible, specialty-specific workflows for cardiology, dentistry, and
          everything in between.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {specialties.map((s) => (
            <div
              key={s.name}
              className="bg-[hsl(40,20%,98%)] dark:bg-gray-800/50 rounded-2xl p-5 md:p-6 border border-gray-200/75 dark:border-gray-700/50 text-center group hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1">
                {s.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
