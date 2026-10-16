'use client';

import { UserDropdown } from "@/shared-components/user-dropdown";
import { getUser } from "@/fetcher/queries";
import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { ModeToggle } from "@/shared-components/mode-toggle";
import { BrandMark } from "@/app/(landing)/components/landing-ui";

// Navbar Skeleton
export function NavbarSkeleton() {
  return (
    <header className="bg-background border-b h-16 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-full">

        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
          <Skeleton className="h-7 w-14 shrink-0" />
        </div>

        {/* Right: theme toggle + user dropdown */}
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>
    </header>
  );
}

export function Navbar() {
  // get the user from the session
  const { data: user, isLoading: isUserLoading, error: userError } = getUser();
  const { toggle } = useSidebar();

  if (isUserLoading) {
    return <NavbarSkeleton />
  }

  if (!user) return null;

  return (
    <header className="bg-background border-b h-16 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-full">

        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle sidebar"
            className="cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <BrandMark className="cursor-pointer" />
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark theme toggle */}
          <ModeToggle />
          {/* Right: user dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
