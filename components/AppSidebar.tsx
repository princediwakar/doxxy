// File: src/components/app-sidebar.tsx
"use client";
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, User2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { navItems, isActiveLink } from "@/config/navigation";

import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function openCommandPalette() {
  document.dispatchEvent(new Event("open-command-palette"));
}

export function AppSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const { user, activeClinicId, activeClinicName, activeClinicRole, signOut, profileName } = useAppState();

  const pathname = usePathname();

  const role = activeClinicRole;
  const topItems = navItems.filter(item => item.topGroup);
  const bottomItems = navItems.filter(item => !item.topGroup && (role ? item.roles.includes(role) : true));

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const isSearch = item.label === "Search";
    const isActive = isSearch ? false : isActiveLink(pathname, item.path);

    const linkContent = (
      <>
        <item.icon size={18} className={cn(
          "flex-shrink-0 transition-transform group-hover:scale-105",
          isCollapsed ? "mx-auto" : "mr-3",
          isActive ? "text-primary" : "text-muted-foreground"
        )} />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </>
    );

    const className = cn(
      "flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[48px] w-full",
      isCollapsed ? "justify-center px-2" : "px-4",
      isActive
        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
    );

    if (isSearch) {
      return (
        <li key={item.path}>
          {isCollapsed ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button onClick={openCommandPalette} className={className}>
                  {linkContent}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={openCommandPalette} className={className}>
              {linkContent}
            </button>
          )}
        </li>
      );
    }

    const link = (
      <Link
        href={item.path}
        className={className}
      >
        {linkContent}
      </Link>
    );

    if (isCollapsed) {
      return (
        <li key={item.path}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              {link}
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li key={item.path}>{link}</li>;
  };

  const filterByRole = (items: typeof navItems) =>
    role ? items.filter(item => item.roles.includes(role)) : items.filter(item => item.roles.includes("superadmin") && item.roles.includes("staff") && item.roles.includes("doctor"));

  const visibleTopItems = filterByRole(topItems);
  const visibleBottomItems = bottomItems; // already filtered in declaration

  return (
    <div className="flex flex-col h-screen sticky top-0 left-0 w-full flex-shrink-0">
      {/* Header with Logo */}
      <div className={cn("flex items-center p-3 h-14", isCollapsed ? "justify-center" : "justify-start")}>
        <Link href="/">
          {isCollapsed ? (
            <span className="text-2xl font-semibold select-none" style={{ color: "#1f8fff", fontFamily: "Georgia, serif" }}>D</span>
          ) : (
            <img src="/logo.svg" alt="Doxxy" className="h-10" />
          )}
        </Link>
      </div>

      {/* Top Navigation Group */}
      <nav className="flex-1 overflow-y-auto p-3 pb-0">
        <ul className={cn("space-y-2", isCollapsed && "flex flex-col items-center")}>
          {visibleTopItems.map(renderNavItem)}
        </ul>
      </nav>

      {/* Bottom Section: Settings, Clinic Switcher, Profile */}
      <div className={cn("mt-auto p-3 space-y-2", isCollapsed && "flex flex-col items-center")}>
        {visibleBottomItems.length > 0 && (
          <ul className={cn("space-y-2", isCollapsed && "flex flex-col items-center w-full")}>
            {visibleBottomItems.map(renderNavItem)}
          </ul>
        )}

        {!isCollapsed && activeClinicId && (
          <>
            <Separator />
            <ClinicSwitcher />
          </>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-12 justify-start focus-visible:ring-2 focus-visible:ring-primary hover:bg-white/50 rounded-lg",
                isCollapsed ? "w-10 px-0 justify-center" : "w-full"
              )}
            >
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Avatar className={cn("h-8 w-8 ring-2 ring-primary/20", isCollapsed ? "mx-auto" : "mr-3")}>
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {profileName || user?.email}
                  </TooltipContent>
                )}
              </Tooltip>
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
