import { Poppins } from "next/font/google";

// Poppins font for auth routes only
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function AuthLayout({ children }: { children: React.ReactNode }) {

  // No Navbar in this auth group 
  return (
    <div className={`${poppins.variable} font-sans`} style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      {children}
    </div>
  );
}

