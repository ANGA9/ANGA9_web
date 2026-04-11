import {
  BadgeCheck,
  MapPin,
  Pencil,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const addresses = [
  {
    id: "a1",
    label: "Head Office",
    line1: "Metro Mart Pvt. Ltd.",
    line2: "42, Industrial Area Phase II",
    city: "Pune, Maharashtra 411018",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Warehouse",
    line1: "Metro Mart \u2014 Central Warehouse",
    line2: "Plot 7, MIDC Bhosari",
    city: "Pune, Maharashtra 411026",
    isDefault: false,
  },
];

export default function CustomerAccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      {/* Profile */}
      <div className="rounded-xl border border-[#E5E0D8] bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1C1917]">My Profile</h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8C1B5] px-3 py-1.5 text-xs font-semibold text-[#1C1917] bg-transparent hover:bg-[#F2EFE9] transition-colors">
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        </div>

        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-[#F2EFE9] text-[#78716C] font-bold text-xl">
              MP
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#1C1917]">
              Metro Mart Pvt. Ltd.
            </h3>
            <p className="text-sm text-[#78716C]">
              buyer@metro.in &middot; +91 98234 56789
            </p>
            <p className="text-sm text-[#78716C]">
              GSTIN: 27AABCM1234R1ZX
            </p>
          </div>
        </div>

        <Separator className="my-5 bg-[#E5E0D8]" />

        {/* Verification badge */}
        <div className="flex items-center gap-3 rounded-lg bg-[#E1F5EE] border border-[#0F6E56]/20 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F6E56]/10">
            <BadgeCheck className="h-5 w-5 text-[#0F6E56]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F6E56]">
              Verified Business
            </p>
            <p className="text-xs text-[#78716C]">
              GST verified &middot; Business documents approved &middot; Since
              March 2023
            </p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-xl border border-[#E5E0D8] bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1C1917]">
            Address Book
          </h2>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#2C2825] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#44403C] transition-colors">
            + Add Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-lg border border-[#E5E0D8] p-4 flex items-start gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F2EFE9]">
                {addr.label === "Warehouse" ? (
                  <Building2 className="h-5 w-5 text-[#78716C]" />
                ) : (
                  <MapPin className="h-5 w-5 text-[#78716C]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1C1917]">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-[#F2EFE9] px-2 py-0.5 text-[10px] font-semibold text-[#44403C]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#78716C]">
                  {addr.line1}
                </p>
                <p className="text-sm text-[#78716C]">
                  {addr.line2}
                </p>
                <p className="text-sm text-[#78716C]">{addr.city}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-xs font-medium text-[#44403C] hover:underline">
                  Edit
                </button>
                {!addr.isDefault && (
                  <button className="text-xs font-medium text-[#78716C] hover:underline">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-[#E5E0D8] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1C1917] mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "My Orders", href: "/customer/orders" },
            { label: "Saved Items", href: "/customer/wishlist" },
            { label: "Cart", href: "/customer/cart" },
            { label: "Help & Support", href: "#" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg border border-[#E5E0D8] px-4 py-3 text-sm font-medium text-[#1C1917] text-center hover:bg-[#F2EFE9] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
