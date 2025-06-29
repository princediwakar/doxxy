// components/Header.tsx

import { memo } from "react";
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Shield, 
  FileText, 
  ChevronDown,
  Menu,
  X,
  Home,
  Zap,
  CreditCard,
  Users,
  Phone,
  HelpCircle,
  BookOpen,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppHeader = memo(() => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Define public routes where we want to show the navbar
  const publicRoutes = [
    '/', '/auth', '/privacy', '/terms', '/features', '/pricing', 
    '/about', '/contact', '/faq', '/security', '/blog', '/comparisons',
    '/comparisons/doxxy-vs-eka-care', '/comparisons/eka-care-alternative',
    '/comparisons/doxxy-vs-practo'
  ];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Don't show header on private routes (they have their own layout)
  if (!isPublicRoute) {
    return null;
  }

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/features", label: "Features", icon: Zap },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/comparisons", label: "Comparisons", icon: BarChart3 },
    { href: "/about", label: "About", icon: Users },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const resourceItems = [
    { href: "/blog", label: "Blog & Resources", icon: BookOpen },
    { href: "/faq", label: "Help Center", icon: HelpCircle },
    { href: "/security", label: "Security", icon: Shield },
    { href: "/privacy", label: "Privacy Policy", icon: Shield },
    { href: "/terms", label: "Terms of Service", icon: FileText },
  ];

  return (
    <>
      <div className="h-16 fixed top-0 left-0 right-0 z-50 border-b border-border supports-[backdrop-filter]:bg-background/80">
        <header className="flex justify-between items-center max-w-7xl h-full px-4 mx-auto">
          <nav className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Doxxy" className="w-24" />
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            {location.pathname !== '/auth' && location.pathname !== '/complete-profile' && (
              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.slice(1).map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href} 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === item.href 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Resources Dropdown */}
                {/* <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Resources
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {resourceItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={item.href} className="flex items-center gap-2 w-full">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* CTA Button - only show on non-auth routes */}
            {location.pathname !== '/auth' && location.pathname !== '/complete-profile' && (
              <Link to="/auth">
                <Button 
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            {location.pathname !== '/auth' && location.pathname !== '/complete-profile' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && location.pathname !== '/auth' && location.pathname !== '/complete-profile' && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
            <nav className="p-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Resources Section */}
              {/* <div className="pt-3 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground mb-3 px-3">
                  RESOURCES
                </div>
                {resourceItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div> */}
            </nav>
          </div>
        )}
      </div>
      <div style={{ paddingTop: '4rem' }}>
        <Outlet />
      </div>
    </>
  );
});

AppHeader.displayName = "AppHeader";