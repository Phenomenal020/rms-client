// Home page: Simply redirects to the dashboard

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <h1>Home Page</h1>
      <Link href="/sign-up">Sign Up</Link>
      <br />
      <br />
      <Link href="/sign-in">Login</Link>
      <br />
      <br />
      <Link href="/dashboard">Dashboard</Link>
      <br />

    </div>
  );
}
