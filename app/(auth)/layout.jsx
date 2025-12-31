import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {

  // get the user from the session
  const session = await getServerSession();
  const user = session?.user;

  // if the user is already logged in and verified, redirect to dashboard
  // BUT allow unverified users to access auth pages (like verify-email)
  if (user && user.emailVerified) {
    redirect("/settings/profile");
  }

  // No Navbar in this auth group 
  return children;
}

