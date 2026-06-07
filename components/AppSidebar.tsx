"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { operationalNav, managementNav, isActiveLink } from "@/config/navigation";

import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

// Update the interface to accept the toggle function
interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const { user, activeClinicId, activeClinicRole, signOut, profileName } = useAppState();
  const pathname = usePathname();
  const role = activeClinicRole;
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleOperationalNav = operationalNav.filter(item => !role || item.roles.includes(role));
  const visibleManagementNav = managementNav.filter(item => !role || item.roles.includes(role));

  const renderNavItem = (item: any) => {
    const isActive = isActiveLink(pathname, item.path);
    const className = cn(
      "flex items-center justify-start py-2.5 rounded-lg text-sm transition-all duration-200 group min-h-[40px] w-full border border-transparent overflow-hidden mb-1",
      isCollapsed ? "px-2 justify-center" : "px-3",
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

    return (
      <li key={item.path}>
        <Link href={item.path} className={className} title={isCollapsed ? item.label : undefined}>
          <item.icon size={18} className={cn("flex-shrink-0", isActive ? "text-primary" : "")} />
          {!isCollapsed && (
            <span className="ml-3 truncate">{item.label}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-screen sticky top-0 left-0 w-full flex-shrink-0">
      
      {/* 1. Brand Logo (Clean and isolated) */}
      <div className={cn("flex items-center p-4 h-16", isCollapsed ? "justify-center" : "justify-start")}>
        <Link href="/">
          <img src={isCollapsed ? "/logo-icon.svg" : "/logo.svg"} alt="Doxxy" className="h-8" />
        </Link>
      </div>

      {/* 2. Clinic Context */}
      {activeClinicId && (
        <div className={cn("mb-4", isCollapsed ? "px-0 flex justify-center" : "px-3")}>
          <ClinicSwitcher isCollapsed={isCollapsed} />
        </div>
      )}

      {/* 3. Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 [&::-webkit-scrollbar]:hidden">
        {visibleOperationalNav.length > 0 && (
          <div className="mb-6">
            {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground mb-2 px-3 uppercase tracking-wider">Operations</p>}
            <ul>{visibleOperationalNav.map(renderNavItem)}</ul>
          </div>
        )}

        {visibleManagementNav.length > 0 && (
          <div>
             {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground mb-2 px-3 uppercase tracking-wider">Management</p>}
            <ul>{visibleManagementNav.map(renderNavItem)}</ul>
          </div>
        )}
      </nav>

      {/* 4. Bottom Anchor (Toggle + Profile) */}
      <div className="mt-auto p-3 border-t">
        
        {/* NEW: The integrated Toggle Button */}
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            "w-full mb-2 text-muted-foreground hover:text-foreground transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} className="flex-shrink-0" />
          ) : (
            <>
              <PanelLeftClose size={18} className="flex-shrink-0 mr-3" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </Button>

        {/* Existing User Profile Popover */}
        <Popover open={profileOpen} onOpenChange={setProfileOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-12 hover:bg-muted rounded-lg overflow-hidden transition-all duration-300",
                isCollapsed ? "w-10 px-0 justify-center mx-auto flex" : "w-full justify-start px-3"
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0 border border-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col text-left whitespace-nowrap ml-3 overflow-hidden">
                  <span className="text-sm font-medium text-foreground truncate block">
                    {profileName || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {activeClinicRole}
                  </span>
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 mb-2 p-1" side="right" align="end">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setProfileOpen(false)}>
              <Link href="/profile"><User2 size={16} className="mr-2" /> Profile</Link>
            </Button>
            <Separator className="my-1" />
            <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={signOut}>
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}