import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }) {
  const session = await getServerSession();
  const user = session?.user;

  if (user) redirect("/dashboard");

  return children;
}

