import Link from "next/link"
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Image src="/logo.svg" alt="Doxxy" className="w-20 mb-4" width="80" height="20" />
            <p className="text-sm leading-relaxed max-w-xs">
            Doxxy is the modern healthcare management platform for small to medium clinics.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>+91 7388890554</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>prince@supersite.app</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Product</p>
              <div className="space-y-3">
                <Link href="/features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/comparisons" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Doxxy vs Others
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Resources</p>
              <div className="space-y-3">
                <Link href="/resources" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
                <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
                <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link href="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Knowledge Base
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal</p>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Compact location & specialty links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <div>
              <span className="font-semibold text-foreground">Cities: </span>
              {[
                { href: '/cities/mumbai', label: 'Mumbai' },
                { href: '/cities/delhi', label: 'Delhi' },
                { href: '/cities/bangalore', label: 'Bangalore' },
                { href: '/cities/pune', label: 'Pune' },
                { href: '/cities/hyderabad', label: 'Hyderabad' },
                { href: '/cities/chennai', label: 'Chennai' },
                { href: '/cities/ahmedabad', label: 'Ahmedabad' },
                { href: '/cities/kolkata', label: 'Kolkata' },
                { href: '/cities/jaipur', label: 'Jaipur' },
                { href: '/cities/lucknow', label: 'Lucknow' },
                { href: '/cities/surat', label: 'Surat' },
                { href: '/cities/nagpur', label: 'Nagpur' },
                { href: '/cities/indore', label: 'Indore' },
                { href: '/cities/bhopal', label: 'Bhopal' },
                { href: '/cities/chandigarh', label: 'Chandigarh' },
                { href: '/cities/kochi', label: 'Kochi' },
                { href: '/cities/vadodara', label: 'Vadodara' },
                { href: '/cities/visakhapatnam', label: 'Visakhapatnam' },
                { href: '/cities/coimbatore', label: 'Coimbatore' },
                { href: '/cities/ludhiana', label: 'Ludhiana' },
                { href: '/cities/agra', label: 'Agra' },
                { href: '/cities/nashik', label: 'Nashik' },
                { href: '/cities/patna', label: 'Patna' },
                { href: '/cities/rajkot', label: 'Rajkot' },
                { href: '/cities/meerut', label: 'Meerut' },
              ].map((city, i) => (
                <span key={city.href}>
                  <Link href={city.href} className="hover:text-foreground transition-colors">{city.label}</Link>
                  {i < 24 && <span className="text-gray-400 dark:text-gray-600"> · </span>}
                </span>
              ))}
            </div>
            <div>
              <span className="font-semibold text-foreground">Specialties: </span>
              {[
                { href: '/specialties/dermatology', label: 'Dermatology' },
                { href: '/specialties/dental', label: 'Dental' },
                { href: '/specialties/ophthalmology', label: 'Ophthalmology' },
                { href: '/specialties/ent', label: 'ENT' },
                { href: '/specialties/pediatrics', label: 'Pediatrics' },
                { href: '/specialties/gynecology', label: 'Gynecology' },
                { href: '/specialties/orthopedics', label: 'Orthopedics' },
                { href: '/specialties/general-physician', label: 'General Physician' },
              ].map((s, i, arr) => (
                <span key={s.href}>
                  <Link href={s.href} className="hover:text-foreground transition-colors">{s.label}</Link>
                  {i < arr.length - 1 && <span className="text-gray-400 dark:text-gray-600"> · </span>}
                </span>
              ))}
            </div>
            <div>
              <span className="font-semibold text-foreground">Also in: </span>
              {[
                { href: '/hi', label: 'हिन्दी' },
                { href: '/bn', label: 'বাংলা' },
                { href: '/ta', label: 'தமிழ்' },
                { href: '/te', label: 'తెలుగు' },
                { href: '/mr', label: 'मराठी' },
                { href: '/kn', label: 'ಕನ್ನಡ' },
              ].map((l, i, arr) => (
                <span key={l.href}>
                  <Link href={l.href} className="hover:text-foreground transition-colors">{l.label}</Link>
                  {i < arr.length - 1 && <span className="text-gray-400 dark:text-gray-600"> · </span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Supersite Technologies Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
 