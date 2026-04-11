import { Shield, Store, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

const portals = [
  {
    title: "Admin Portal",
    description: "Manage marketplace operations, sellers, and analytics",
    icon: Shield,
    color: "#6C47FF",
    href: "/admin",
  },
  {
    title: "Seller Portal",
    description: "List products, manage orders, and track earnings",
    icon: Store,
    color: "#0F6E56",
    href: "/seller",
  },
  {
    title: "Customer Portal",
    description: "Browse products, place orders, and track deliveries",
    icon: ShoppingBag,
    color: "#6C47FF",
    href: "/customer",
  },
];

export default function PortalSwitcherPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-anga-bg px-4 py-16">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C47FF] text-white font-bold text-3xl shadow-lg shadow-[#6C47FF]/20">
          A
        </div>
        <h1 className="text-3xl font-bold text-anga-text tracking-tight">
          ANGA
        </h1>
        <p className="mt-2 text-base text-anga-text-secondary">
          India&apos;s B2B Wholesale Marketplace
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {portals.map((portal) => (
          <Link
            key={portal.title}
            href={portal.href}
            className="group rounded-xl border border-anga-border bg-white p-8 text-center transition-all hover:shadow-lg hover:border-transparent hover:-translate-y-1"
            style={{
              ["--portal-color" as string]: portal.color,
            }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${portal.color}15` }}
            >
              <portal.icon
                className="h-7 w-7"
                style={{ color: portal.color }}
              />
            </div>
            <h2 className="text-lg font-semibold text-anga-text">
              {portal.title}
            </h2>
            <p className="mt-2 text-sm text-anga-text-secondary leading-relaxed">
              {portal.description}
            </p>
            <span
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: portal.color }}
            >
              Enter Portal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-xs text-anga-text-secondary">
        Verified businesses only &middot; GST registered &middot; Secure
        platform
      </p>
    </div>
  );
}
