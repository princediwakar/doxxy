// src/components/AppHeader.tsx
"use client";
import { memo } from "react";
import Link from 'next/link';
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
              <img src="/logo.svg" alt="Doxxy" className="w-24" width="96" height="24" />
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
              <Link href="/auth">
                <Button 
                  size="sm" 
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-none transition-colors duration-200 ease-in-out"
                >
                  Login
                </Button>
              </Link>
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
