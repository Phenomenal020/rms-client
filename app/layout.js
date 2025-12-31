import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AddSubjectsProvider } from "@/context/AddSubjectsContext";
import { AddStudentsProvider } from "@/context/AddStudentsContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Result Management System",
  description: "Result Management System developed for easy result management and analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <AddSubjectsProvider>
              <AddStudentsProvider>
                {children}
                <Toaster position="top-right" richColors />
              </AddStudentsProvider>
            </AddSubjectsProvider>
      </body>
    </html>
  );
}
