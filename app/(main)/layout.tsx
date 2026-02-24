import { Navbar } from "@/shared-components/navbar";
import AppSidebar from "./sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
