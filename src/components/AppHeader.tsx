// components/Header.tsx

import { memo } from "react";
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Stethoscope, Shield, FileText } from "lucide-react";

export const AppHeader = memo(() => {
  const location = useLocation();
  
  // Define public routes where we want to show the navbar
  const publicRoutes = ['/auth', '/privacy', '/terms'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Don't show header on private routes (they have their own layout)
  if (!isPublicRoute) {
    return null;
  }

  return (
    <div className="h-16 fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border supports-[backdrop-filter]:bg-background/80">
      <header className="flex justify-between items-center max-w-6xl h-full px-4 mx-auto">
        <nav className="flex items-center space-x-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Doxxy" className="w-24 " />
            </div>
          </Link>
          
          {/* Navigation Links - only show on non-auth routes */}
          {location.pathname !== '/auth' && (
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/privacy" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Shield className="h-4 w-4" />
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <FileText className="h-4 w-4" />
                Terms
              </Link>
            </div>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* CTA Button - only show on non-auth routes */}
          {location.pathname !== '/auth' && (
            <Link to="/auth">
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medical"
              >
                Get Started
              </Button>
            </Link>
          )}
          
          {/* Mobile navigation for non-auth routes */}
          {location.pathname !== '/auth' && (
            <div className="md:hidden flex items-center space-x-3">
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Privacy Policy"
              >
                <Shield className="h-5 w-5" />
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Terms of Service"
              >
                <FileText className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
});

AppHeader.displayName = "AppHeader";