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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "ANGA9 - India's Trusted B2B Wholesale Marketplace",
    description: "Shop wholesale for verified businesses. Access exclusive prices on fashion, electronics, home decor, and industrial supplies.",
    siteName: 'ANGA9',
    type: 'website',
  },
};

const rootWebsiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ANGA9",
  alternateName: ["ANGA9 B2B", "ANGA9 Wholesale"],
  url: "https://anga9.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://anga9.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const rootOrganizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ANGA9",
  alternateName: "ANGA9 B2B Wholesale Marketplace",
  url: "https://anga9.com",
  logo: "https://anga9.com/favicon.ico",
  description:
    "ANGA9 is India's leading B2B wholesale marketplace connecting verified sellers with retailers across 19,000+ pin codes at 0% commission.",
  sameAs: ["https://seller.anga9.com"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@anga9.com",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootWebsiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootOrganizationLd) }}
        />
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
