import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "react-hot-toast";

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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#FFFFFF',
                  color: '#1A1A2E',
                  fontSize: '14px',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: 500,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  border: '1px solid #E8EEF4',
                },
                success: {
                  iconTheme: {
                    primary: '#4CAF50',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
