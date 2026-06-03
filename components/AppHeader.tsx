// src/components/AppHeader.tsx
"use client";
import { memo } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  Zap,
  CreditCard,
  Phone,
  BarChart3,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Compass,
} from "lucide-react";
import { useState } from "react";

// --- MODULAR COMPONENTS ---

const NavLinkItem = ({ to, label, currentPath }: { to: string; label: string; currentPath: string }) => (
  <Link
    href={to}
    className={`text-sm font-medium transition-colors duration-200 ease-in-out
      ${currentPath === to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
  >
    {label}
  </Link>
);

const MobileNavItem = ({ to, label, icon: Icon, onClick, currentPath }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; currentPath: string }) => (
  <Link
    href={to}
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ease-in-out
      ${currentPath === to
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
        : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800'}`}
  >
    <Icon className="h-5 w-5" />
    {label}
  </Link>
);

// --- MAIN COMPONENT ---

export const AppHeader = memo(() => {
  const location = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // With the new route group structure, AppHeader is only used in (public) layout
  // So we don't need to check if route is public anymore
  // Just check if we should show navigation (not on auth page)

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/features", label: "Features", icon: Zap },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/comparisons", label: "Comparisons", icon: BarChart3 },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/resources", label: "Resources", icon: Compass },
    { href: "/help", label: "Help", icon: HelpCircle },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const showNav = location !== '/auth' && location !== '/complete-profile';

  return (
    <>
      <div className="h-16 fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <header className="flex justify-between items-center max-w-7xl h-full px-6 lg:px-8 mx-auto">
          <nav className="flex items-center space-x-8" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 ease-in-out">
              <Image src="/logo.svg" alt="Doxxy" className="w-24" width="96" height="24" priority />
            </Link>

            {/* Desktop Navigation */}
            {showNav && (
              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.slice(1).map((item) => (
                  <NavLinkItem
                    key={item.href}
                    to={item.href}
                    label={item.label}
                    currentPath={location}
                  />
                ))}
              </div>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* CTA Button - only show on non-auth routes */}
            {showNav && (
              <>
                <a
                  href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors duration-200 ease-in-out"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat
                </a>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-none transition-colors duration-200 ease-in-out"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Button */}
            {showNav && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && showNav && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-transform duration-300 ease-in-out transform origin-top">
            <nav className="p-4 space-y-3">
              {navigationItems.map((item) => (
                <MobileNavItem
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => setMobileMenuOpen(false)}
                  currentPath={location}
                />
              ))}
              <a
                href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ease-in-out text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
});

AppHeader.displayName = "AppHeader";
