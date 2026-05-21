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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function openCommandPalette() {
  document.dispatchEvent(new Event("open-command-palette"));
}

export function AppSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const { user, activeClinicId, activeClinicName, activeClinicRole, signOut, profileName } = useAppState();
  const pathname = usePathname();
  const role = activeClinicRole;

  const topItems = navItems.filter(item => item.topGroup && item.sidebar !== false);
  const bottomItems = navItems.filter(item => !item.topGroup && (role ? item.roles.includes(role) : true));

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const isSearch = item.label === "Search";
    const isActive = isSearch ? false : isActiveLink(pathname, item.path);

    const linkContent = (
      <>
        <item.icon size={18} className={cn(
          "flex-shrink-0 transition-transform group-hover:scale-105",
          isActive ? "text-primary" : "text-muted-foreground"
        )} />
        {/* FIX: CSS width animation instead of React unmounting */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 whitespace-nowrap flex-1",
          isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
        )}>
          <span className="font-medium">{item.label}</span>
        </div>
      </>
    );

    const className = cn(
      "flex items-center py-3 rounded-lg text-sm transition-all duration-200 group min-h-[48px] w-full border border-transparent overflow-hidden",
      isCollapsed ? "px-2" : "px-4",
      isActive
        ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
    );

    if (isSearch) {
      return (
        <li key={item.path}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={openCommandPalette} className={className}>
                {linkContent}
              </button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
          </Tooltip>
        </li>
      );
    }

    const link = (
      <Link href={item.path} className={className}>
        {linkContent}
      </Link>
    );

    return (
      <li key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
        </Tooltip>
      </li>
    );
  };

  const filterByRole = (items: typeof navItems) =>
    role ? items.filter(item => item.roles.includes(role)) : items.filter(item => item.roles.includes("superadmin") && item.roles.includes("staff") && item.roles.includes("doctor"));

  const visibleTopItems = filterByRole(topItems);
  const visibleBottomItems = bottomItems;

  return (
    <TooltipProvider delayDuration={150}>
    <div className="flex flex-col h-screen sticky top-0 left-0 w-full flex-shrink-0">
      <div className={cn("flex items-center p-3 h-14", isCollapsed ? "justify-center" : "justify-start")}>
        <Link href="/">
          {isCollapsed ? (
            <span className="text-2xl font-semibold select-none" style={{ color: "#1f8fff", fontFamily: "Georgia, serif" }}>D</span>
          ) : (
            <img src="/logo.svg" alt="Doxxy" className="h-10" />
          )}
        </Link>
      </div>

      {/* FIX: Hide the scrollbar footprint completely */}
      <nav className="flex-1 overflow-y-auto p-3 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <ul className="space-y-2 flex flex-col w-full">
          {visibleTopItems.map(renderNavItem)}
        </ul>
      </nav>

      <div className="mt-auto p-3 flex flex-col w-full space-y-2">
        {visibleBottomItems.length > 0 && (
          <ul className="space-y-2 flex flex-col w-full">
            {visibleBottomItems.map(renderNavItem)}
          </ul>
        )}

        {/* Geometric Lock: reserves exact vertical space whether collapsed or not */}
        {activeClinicId && (
          <div className="relative w-full h-[60px] flex-shrink-0">
            <div className={cn(
              "absolute inset-0 flex flex-col justify-end overflow-hidden transition-all duration-300",
              isCollapsed ? "opacity-0 pointer-events-none translate-y-1" : "opacity-100 translate-y-0"
            )}>
              <Separator className="mb-2" />
              <div className="w-full">
                <ClinicSwitcher />
              </div>
            </div>
          </div>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-12 justify-start focus-visible:ring-2 focus-visible:ring-primary hover:bg-background/50 rounded-lg overflow-hidden transition-all duration-300",
                isCollapsed ? "w-10 px-0 justify-center" : "w-full px-3"
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 flex-shrink-0">
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
              {/* FIX: CSS width transition for the profile text */}
              <div className={cn(
                "overflow-hidden transition-all duration-300 flex flex-col text-left whitespace-nowrap",
                isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
              )}>
                <span className="text-sm font-medium text-foreground truncate block">
                  {profileName || user?.email}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {activeClinicRole}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 mb-2 p-0 shadow-lg border" side="right" align="end">
             {/* Unchanged Popover Content */}
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
    </TooltipProvider>
  );
}