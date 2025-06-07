// File: src/components/app-sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { Users, User, CalendarPlus, CreditCard, Home, LogOut, Settings, FileText, Pill } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import ClinicSwitcher from "@/components/clinic-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/", roles: ['superadmin', 'staff', 'doctor'] },
  { icon: Users, label: "Patients", path: "/patients", roles: ['staff', 'doctor', 'superadmin'] },
  { icon: CalendarPlus, label: "Appointments", path: "/appointments", roles: ['staff', 'doctor', 'superadmin'] },
  { icon: FileText, label: "Medical Records", path: "/medical-records", roles: ['doctor', 'superadmin'] },
  { icon: Pill, label: "Prescriptions", path: "/prescriptions", roles: ['doctor', 'superadmin'] },

  { icon: CreditCard, label: "Billing", path: "/billing", roles: ['staff', 'superadmin'] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ['superadmin'] },
];

export function AppSidebar() {
  const { user, activeClinic, activeClinicRole, signOut, loading, profileName } = useAuth();
  const location = useLocation();

  // Helper to determine if a link is active, handling root path specifically
  const isActiveLink = (path: string) => {
    // For the root path '/', it should only be active if the current location is exactly '/'
    if (path === '/') return location.pathname === '/';
    // For other paths, check if the current path starts with the item's path
    return location.pathname.startsWith(path);
  };

  return (
    // Use a basic div structure for the sidebar
    // Apply Tailwind classes for fixed position, width, height, background, border
    // Add responsive width classes (e.g., w-64, md:w-72) if needed for larger screens
    <div className="flex flex-col border-r bg-background h-screen sticky top-0 left-0 w-64 lg:w-72 flex-shrink-0">
      {/* Header with Logo and Clinic Switcher */}
      {/* Adjusted padding and alignment */}
      <div className="flex items-center gap-2 p-4 h-14 border-b">
          <img src="/logo.svg" alt="Doxxy Logo" className="h-8 w-8" />
        <span className="text-xl font-semibold text-primary">Doxxy</span> {/* Use font-semibold for slightly bolder */}
      </div>

      {/* Clinic Switcher */}
      {/* Adjusted padding */}
      <div className="p-2 border-b">
         {/* Pass sidebarOpen state if ClinicSwitcher needs it for responsive layout */}
         {/* For now, assuming it's open in this basic structure */}
         {/* Ensure ClinicSwitcher handles null activeClinic gracefully */}
         {activeClinic && <ClinicSwitcher sidebarOpen={true} />} {/* Only render if activeClinic is available */}
      </div>

      {/* Navigation Links */}
      {/* Adjusted padding, spacing, and overflow */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {/* Check if activeClinic and activeClinicRole are loaded before mapping */}
          {(!loading && activeClinic && activeClinicRole) ? (
            navItems.map((item) => {
              // Filter based on user role
              if (item.roles.includes(activeClinicRole)) {
                // Construct the full path for NavLink using the path directly
                const fullPath = item.path;
              return (
                <li key={item.path}>
                  <NavLink
                      to={fullPath}
                      // Use isActiveLink helper for className
                      className={cn(
                        "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                        isActiveLink(item.path)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                      <item.icon size={18} className="mr-3 flex-shrink-0" /> {/* Adjusted icon size */}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            }
            return null;
            })
          ) : (
             // Optional: Add a loading state or placeholder for nav items
             <div className="px-3 text-sm text-muted-foreground">Loading navigation...</div>
          )}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      {/* Adjusted padding, spacing, and alignment */}
      <div className="mt-auto p-2 border-t bg-white">
         {/* Check if user is loaded */}
         {!loading && user && user.email ? (
          <Popover>
            <PopoverTrigger asChild>
              {/* Adjusted button size and focus styling */}
              <Button variant="ghost" className="w-full h-11 justify-start focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 mr-3"> {/* Adjusted avatar size and margin */}
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {profileName || user?.email}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            {/* Adjusted popover content placement and width */}
            <PopoverContent className="w-64 mb-2 p-0" side="right" align="end">
              <div className="flex items-center gap-2 p-3"> {/* Adjusted padding */}
                <Avatar className="h-9 w-9"> {/* Adjusted avatar size */}
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                   <span className="text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap"> {/* Adjusted font-weight */}
                     {profileName || user?.email}
                   </span>
                </div>
              </div>
              <Separator className="my-0" /> {/* Use Separator */} {/* Ensure no vertical margin on separator */}
              {/* Adjusted button styling and spacing */}
              <div className="p-1">
                 <Button variant="ghost" className="w-full justify-start" onClick={() => { /* navigate('/profile'); */ }}>
                   <User size={16} className="h-4 w-4 mr-3" /> {/* Adjusted icon margin */}
                View Profile (Coming Soon)
              </Button>
                 <Button variant="ghost" className="w-full justify-start mt-1" onClick={signOut}>
                   <LogOut size={16} className="h-4 w-4 mr-3" /> {/* Adjusted icon margin */}
                Logout
              </Button>
              </div>
            </PopoverContent>
          </Popover>
         ) : (
            // Optional: Add a loading state or placeholder for user info
             <div className="px-3 text-sm text-muted-foreground">Loading user...</div>
        )}
      </div>
    </div>
  );
} 