import { Navbar } from "@/shared-components/navbar";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/shadcn/ui/sidebar";
import AppSidebar from "./sidebar";
import { getServerSession } from "@/src/lib/get-session";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}) {

  const session = await getServerSession();
  const user = session?.user;

  // get the sidebar open state from the cookie to either open or close the sidebar on page load
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_open")?.value === "true";

  if (!user) {
    redirect("/sign-in");
  }

  return (
    // <div className="flex min-h-screen flex-col">
    <>
      <Navbar />
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar className="mt-16"/>
        <main className='w-full'>
          {children}
        </main>

      </SidebarProvider>
    </>
    // </div>
  );
}