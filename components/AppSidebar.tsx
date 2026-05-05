// File: src/components/app-sidebar.tsx
"use client";
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, User2, PanelLeftClose, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { navItems, isActiveLink } from "@/config/navigation";

import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function AppSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const { user, activeClinicId, activeClinicName, activeClinicRole, signOut, profileName } = useAppState();

  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen sticky top-0 left-0 w-full flex-shrink-0">
      {/* Header with Logo and Toggle */}
      <div className={cn("flex items-center p-3 h-14", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <img src="/logo.svg" alt="Doxxy" className="h-10" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-white/50"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      {/* Clinic Switcher */}
      {!isCollapsed && (
        <div className="p-3">
          {activeClinicId && <ClinicSwitcher />}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className={cn("space-y-2", isCollapsed && "flex flex-col items-center")}>
          {navItems.map((item) => {
            const role = activeClinicRole;
            const isCommonToAllRoles = item.roles.includes('superadmin') && item.roles.includes('staff') && item.roles.includes('doctor');
            if (role ? item.roles.includes(role) : isCommonToAllRoles) {
              const fullPath = item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={fullPath}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[48px]",
                      isCollapsed ? "justify-center px-2" : "px-4",
                      isActiveLink(pathname, item.path)
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} className={cn(
                      "flex-shrink-0 transition-transform group-hover:scale-105",
                      isCollapsed ? "mx-auto" : "mr-3",
                      isActiveLink(pathname, item.path) ? "text-primary" : "text-muted-foreground"
                    )} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      <div className={cn("mt-auto p-3", isCollapsed && "flex justify-center")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-12 justify-start focus-visible:ring-2 focus-visible:ring-primary hover:bg-white/50 rounded-lg",
                isCollapsed ? "w-10 px-0 justify-center" : "w-full"
              )}
            >
              <Avatar className={cn("h-8 w-8 ring-2 ring-primary/20", isCollapsed ? "mx-auto" : "mr-3")}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden text-left">
                  <span className="text-sm font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap block">
                    {profileName || user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {activeClinicRole}
                  </span>
                </div>
              )}
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
                  {activeClinicRole} • {activeClinicName}
                </span>
              </div>
            </div>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground" asChild>
                <Link href="/profile">
                  <User2 size={16} className="h-4 w-4 mr-3" />
                  View Profile
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start mt-1 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={signOut}>
                <LogOut size={16} className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 