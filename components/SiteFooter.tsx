import Link from "next/link"
import { Mail, Phone } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <img src="/logo.svg" alt="Doxxy" className="w-20 mb-4" width="80" height="20" />
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
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
                <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
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

        <div className="mt-16 pt-8 border-t border-border text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Supersite Technologies Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
 