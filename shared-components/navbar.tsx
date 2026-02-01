'use client';

import { ModeToggle } from "@/shared-components/mode-toggle";
import { UserDropdown } from "@/shared-components/user-dropdown";
import { getUser } from "@/fetcher/queries";
// import Image from "next/image";
import Link from "next/link";

export function Navbar() {

  // get the user from the session
  const { data: user } =  getUser();

  // if the user is not found, return null
  if (!user) return null;

  return (
    <header className="bg-background border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
