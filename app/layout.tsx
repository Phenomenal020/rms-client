// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Providers from "@/fetcher/Providers";
import { UserProvider } from "@/contexts/user-context";
import { TooltipProvider } from "@/shadcn/ui/tooltip";
import { Oxanium } from "next/font/google";

// // Geist font
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// // Geist Mono font
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Oxanium font
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  fallback: ["oxanium-Fallback", "arial"],
});

// Metadata
export const metadata: Metadata = {
  title: "Result Management System",
  description: "Result Management System developed primarily for Nigerian schools."
};

// RootLayout component > return jsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oxanium.variable} ${oxanium.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        <Providers>
            <TooltipProvider>
            {children}
            </TooltipProvider>
            <Toaster position="top-right" richColors />
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}