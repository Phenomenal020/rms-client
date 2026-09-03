import { Navbar } from "@/shared-components/navbar";
import AppSidebar from "./sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { UserProvider } from "@/contexts/user-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
    <SidebarProvider>
      {/* Navbar sticks to top via sticky */}
      <Navbar />

      {/* Sidebar overlays content from below the navbar */}
      <AppSidebar />

      {/* Main content area */}
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
    </UserProvider>
  );
}
