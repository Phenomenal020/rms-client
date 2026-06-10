'use client';

import { UserDropdown } from "@/shared-components/user-dropdown";
import { getUser } from "@/fetcher/queries";
import { Switch } from "@/shadcn/ui/switch";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";

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

        {/* Centre: Light / Dark theme toggle */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        </div>

        {/* Right: user dropdown */}
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      </div>
    </header>
  );
}

export function Navbar() {

  // get the user from the session
  const { data: user, isLoading: isUserLoading, error: userError } = getUser();
  const { theme, setTheme } = useTheme();
  const { toggle } = useSidebar();

  if (isUserLoading) {
    return <NavbarSkeleton />
  }

  if (!user) return null;

  // if (userError) {
  //   return <div className="text-red-500">Error loading user</div>
  // }

  const isDark = theme === "dark";

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
          <span className="font-bold text-xl text-primary-600">RMS</span>
        </div>

        {/* Centre: Light / Dark theme toggle */}
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
            className='cursor-pointer'
          />
          <Moon className="h-4 w-4 text-slate-400" />
        </div>

        {/* Right: user dropdown */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
