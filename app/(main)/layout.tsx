import { Navbar } from "@/shared-components/navbar";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/shadcn/ui/sidebar";
import AppSidebar from "./sidebar";
import { getUser } from "@/fetcher/queries";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // const { data: user } = await getUser();

  // get the sidebar open state from the cookie to either open or close the sidebar on page load
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_open")?.value === "true";

  // if (!user) {
  //   redirect("/sign-in");
  // }

  return (
    // <div className="flex min-h-screen flex-col">
    <>
     
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar />
        <main className='w-full h-[calc(100vh-64px)]'>
           <Navbar />
          {children}
        </main>

      </SidebarProvider>
    </>
    // </div>
  );
}