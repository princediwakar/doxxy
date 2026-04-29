// src/components/MobileNav.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Users,
  CalendarPlus,
  CreditCard,
  Home,
  LogOut,
  Settings,
  User2,
  Pill,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["superadmin", "staff", "doctor"] },
  { icon: CalendarPlus, label: "Appointments", path: "/appointments", roles: ["staff", "doctor", "superadmin"] },
  { icon: Users, label: "Patients", path: "/patients", roles: ["staff", "doctor", "superadmin"] },
  { icon: CreditCard, label: "Billing", path: "/billing", roles: ["staff", "doctor", "superadmin"] },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"] },
  { icon: User2, label: "Profile", path: "/profile", roles: ["superadmin", "staff", "doctor"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["superadmin"] },
];

export function MobileNav() {
  const { user, activeClinic, activeClinicRole, signOut, profileName } = useAuth();
  const [open, setOpen] = useState(false);
  const location = usePathname();
  const router = useRouter();

  const isActiveLink = (path: string) => {
    const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    if (normalizedPath === "/dashboard") {
      return normalizedLocation === "/dashboard" || normalizedLocation === "/";
    }

    return (
      normalizedLocation === normalizedPath ||
      normalizedLocation.startsWith(normalizedPath + "/")
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 -ml-2 text-muted-foreground hover:text-foreground touch-manipulation"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm mx-0 h-[85dvh] mt-0">
        <DrawerHeader className="text-left relative">
          <DrawerTitle className="flex items-center gap-3">
            <img src="/logo.svg" alt="Doxxy" className="h-8" />
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {activeClinic && <ClinicSwitcher sidebarOpen={false} />}
        </div>

        <Separator className="my-2" />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (activeClinicRole && item.roles.includes(activeClinicRole)) {
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px]",
                      isActiveLink(item.path)
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      size={20}
                      className={cn(
                        "mr-3 flex-shrink-0",
                        isActiveLink(item.path) ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }
              return null;
            })}
          </nav>
        </div>

        <DrawerFooter className="pt-2 pb-8">
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 px-2">
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation("/profile")}
            >
              <User2 size={16} className="mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={signOut}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}