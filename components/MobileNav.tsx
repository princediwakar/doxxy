// src/components/MobileNav.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, User2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { operationalNav, managementNav, isActiveLink } from "@/config/navigation";

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

export function MobileNav() {
  const { user, activeClinicId, activeClinicName, activeClinicRole, signOut, profileName } = useAppState();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
            <Image src="/logo.svg" alt="Doxxy" className="h-8" width="128" height="32" />
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {activeClinicId && <ClinicSwitcher />}
        </div>

        <Separator className="my-2" />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {(activeClinicRole ? [...operationalNav, ...managementNav].filter(item => item.roles.includes(activeClinicRole)) : []).map((item) => (
              <DrawerClose key={item.path} asChild>
                <Link
                  href={item.path}
                  className={cn(
                    "w-full flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px]",
                    isActiveLink(pathname, item.path)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "mr-3 flex-shrink-0",
                      isActiveLink(pathname, item.path) ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </DrawerClose>
            ))}
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
                {activeClinicRole} • {activeClinicName}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/profile">
                  <User2 size={16} className="mr-2" />
                  Profile
                </Link>
              </Button>
            </DrawerClose>
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
