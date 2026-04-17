import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://anga9.com'),
  title: {
    template: '%s | ANGA9',
    default: "ANGA9 - India's Trusted B2B Wholesale Marketplace",
  },
  description: "Join ANGA9, India's premier B2B e-commerce platform. Shop wholesale for verified businesses and access exclusive prices on fashion, electronics, home decor, and industrial supplies.",
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans" style={{ fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
