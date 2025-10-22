import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";

// Add Poppins as a cool and modern font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Easy Skills",
  description: "Easy Skills is a platform for learning new skills",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider >
      <html lang="en" >
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} font-sans antialiased`}
        >
          
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
