"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User2 } from "lucide-react";

import { useAppState } from "@/contexts/AppStateContext";
import ClinicSwitcher from "@/components/ClinicSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function MobileHeader() {
  const { user, activeClinicId, activeClinicName, activeClinicRole, signOut, profileName } = useAppState();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b pt-safe">
      <div className="flex items-center h-14 px-3 gap-2">
        <Image src="/logo.svg" alt="Doxxy" className="h-7 flex-shrink-0" width="112" height="28" />

        <div className="min-w-0 flex-1">
          {activeClinicId && <ClinicSwitcher />}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 shadow-lg border" side="bottom" align="end">
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
    </header>
  );
}
