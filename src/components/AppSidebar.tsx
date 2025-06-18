// File: src/components/app-sidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Users, User, CalendarPlus, CreditCard, Home, LogOut, Settings, FileText, Pill, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/", roles: ['superadmin', 'staff', 'doctor'] },
  { icon: CalendarPlus, label: "Appointments", path: "/appointments", roles: ['staff', 'doctor', 'superadmin'] },
  { icon: Users, label: "Patients", path: "/patients", roles: ['staff', 'doctor', 'superadmin'] },
  // { icon: FileText, label: "Medical Records", path: "/medical-records", roles: ['doctor', 'superadmin'] },
  { icon: Pill, label: "Prescriptions", path: "/prescriptions", roles: ['doctor', 'superadmin'] },
  { icon: CreditCard, label: "Billing", path: "/billing", roles: ['staff', 'superadmin'] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ['superadmin'] },
];

export function AppSidebar() {
  const { user, activeClinic, activeClinicRole, signOut, loading, profileName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Helper to determine if a link is active, handling root path specifically
  const isActiveLink = (path: string) => {
    // For the root path '/', it should only be active if the current location is exactly '/'
    if (path === '/') return location.pathname === '/';
    // For other paths, check if the current path starts with the item's path
    return location.pathname.startsWith(path);
  };

  return (
    // Subtle, professional sidebar design
    <div className="flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm h-screen sticky top-0 left-0 w-64 lg:w-72 flex-shrink-0 shadow-sm">
      {/* Header with Medical Logo and Clinic Switcher */}
      <div className="flex items-center gap-3 p-4 h-14 border-b border-border/40">
          <img src="/logo.svg" alt="Doxxy" className="h-10" />
      </div>

      {/* Clinic Switcher */}
      <div className="p-3 border-b border-border/40">
         {activeClinic && <ClinicSwitcher sidebarOpen={true} />}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2">
          {(!loading && activeClinic && activeClinicRole) ? (
            navItems.map((item) => {
              // Filter based on user role
              if (item.roles.includes(activeClinicRole)) {
                const fullPath = item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                        to={fullPath}
                        className={cn(
                          "flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[48px]",
                          isActiveLink(item.path)
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                      )}
                    >
                        <item.icon size={18} className={cn(
                          "mr-3 flex-shrink-0 transition-transform group-hover:scale-105",
                          isActiveLink(item.path) ? "text-primary" : "text-muted-foreground"
                        )} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              }
              return null;
            })
          ) : (
             <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/30 rounded-lg animate-pulse">
               Loading navigation...
             </div>
          )}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      <div className="mt-auto p-3 border-t border-border/40">
         {!loading && user && user.email ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full h-12 justify-start focus-visible:ring-2 focus-visible:ring-primary hover:bg-muted/50 rounded-lg"
              >
                <Avatar className="h-8 w-8 mr-3 ring-2 ring-primary/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden text-left">
                  <span className="text-sm font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap block">
                    {profileName || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {activeClinicRole}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 mb-2 p-0 shadow-lg border" side="right" align="end">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                   <span className="text-sm font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap block">
                     {profileName || user?.email}
                   </span>
                   <span className="text-xs text-muted-foreground capitalize">
                     {activeClinicRole} • {activeClinic?.clinics?.name}
                   </span>
                </div>
              </div>
              <Separator />
              <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => { navigate('/profile'); }}>
                    <User size={16} className="h-4 w-4 mr-3" />
                    View Profile
                 </Button>
                 <Button variant="ghost" className="w-full justify-start mt-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
                   <LogOut size={16} className="h-4 w-4 mr-3" />
                   Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
         ) : (
             <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/30 rounded-lg animate-pulse">
               Loading user...
             </div>
        )}
      </div>
    </div>
  );
} 