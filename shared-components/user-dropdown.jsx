"use client";

import { authClient } from "@/src/lib/auth-client";
import { LogOutIcon, ShieldIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";

export function UserDropdown({ user }) {
  return (
    <DropdownMenu>
      {/* Button: User Profile Image or User Icon Dropdown Trigger */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={16}
              height={16}
              className="rounded-full object-cover"
            />
          ) : (
            <UserIcon />
          )}
          {/* <span className="max-w-[12rem] truncate">{user.name}</span> */}
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown Menu Content: User Profile, Admin, Sign Out */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        {/* Separator: Between User Email and User Profile */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <UserIcon className="size-4" /> <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {/* Only show if the user is an admin */}
        {user.role === "admin" && <AdminItem />}
        {/* Sign Out Dropdown Item */}
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Admin Dropdown Item
function AdminItem() {
  return (
    <DropdownMenuItem asChild>
      <Link href="/admin">
        <ShieldIcon className="size-4" /> <span>Admin</span>
      </Link>
    </DropdownMenuItem>
  );
}

// Sign Out Dropdown Item
function SignOutItem() {
  const router = useRouter();

  // when the user clicks the sign out dropdown item
  async function handleSignOut() {
    const { error } = await authClient.signOut(); 
    // invalidates the user session on the server, removes authentication cookies, and clears session data.
    if (error) {
      toast.error(error.message || "Something went wrong");  // if there is an error, show the error message
    } else {
      toast.success("Signed out successfully");
      router.push("/sign-in");  // if there is no error, redirect to the sign in page
    }
  }

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOutIcon className="size-4" /> <span>Sign out</span>
    </DropdownMenuItem>
  );
}
// 