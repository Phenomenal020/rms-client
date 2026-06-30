import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Providers from "@/fetcher/Providers";
import { UserProvider } from "@/contexts/user-context";
import { TooltipProvider } from "@/shadcn/ui/tooltip";

// Geist font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: "Result Management System",
  description: "Result Management System developed primarily for Nigerian schools."
};

// RootLayout component > return jsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        <Providers>
          <UserProvider>
            <TooltipProvider>
            {children}
            </TooltipProvider>
            <Toaster position="top-right" richColors />
          </UserProvider>
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}