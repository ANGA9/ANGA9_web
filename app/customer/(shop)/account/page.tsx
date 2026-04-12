"use client";

import { useState } from "react";
import {
  User,
  Package,
  MapPin,
  Building2,
  Settings,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

const navItems = [
  { label: "Profile", icon: User },
  { label: "My Orders", icon: Package },
  { label: "Addresses", icon: MapPin },
  { label: "Business Info", icon: Building2 },
  { label: "Settings", icon: Settings },
];

const profileFields = [
  { label: "Full Name", value: "Rahul Kapoor" },
  { label: "Phone", value: "+91 98234 56789" },
  { label: "Email", value: "rahul@metromart.in" },
  { label: "GSTIN", value: "27AABCM1234R1ZX" },
  { label: "Company Name", value: "Metro Mart Pvt. Ltd." },
  { label: "City", value: "Pune, Maharashtra" },
];

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
    line1: "Metro Mart — Central Warehouse",
    line2: "Plot 7, MIDC Bhosari",
    city: "Pune, Maharashtra 411026",
    isDefault: false,
  },
];

export default function CustomerAccountPage() {
  const [activeNav, setActiveNav] = useState("Profile");

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <div
            className="rounded-[14px] border overflow-hidden"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            {navItems.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors",
                    isActive ? "border-l-[3px]" : "border-l-[3px] border-transparent"
                  )}
                  style={{
                    background: isActive ? t.bgBlueTint : "transparent",
                    color: isActive ? t.bluePrimary : t.textSecondary,
                    borderLeftColor: isActive ? t.bluePrimary : "transparent",
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
          {/* Profile card */}
          <div
            className="rounded-[14px] border p-6"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: t.bluePrimary }}
              >
                RK
              </div>

              <div className="flex-1">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: t.textPrimary }}
                >
                  Rahul Kapoor
                </h2>
                <p className="text-sm mt-0.5" style={{ color: t.textSecondary }}>
                  rahul@metromart.in
                </p>

                {/* Verified badge */}
                <span
                  className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: t.bgDelivered, color: t.inStock }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Business
                </span>
              </div>

              <button
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: t.yellowCta, color: t.ctaText }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Details grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {profileFields.map((field) => (
                <div key={field.label}>
                  <p className="text-[11px] mb-0.5" style={{ color: t.textMuted }}>
                    {field.label}
                  </p>
                  <p className="text-sm" style={{ color: t.textPrimary }}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Address book */}
          <div
            className="rounded-[14px] border p-6"
            style={{ background: t.bgCard, borderColor: t.border }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: t.textPrimary }}
            >
              Address Book
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: t.border }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: t.textPrimary }}
                    >
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: t.bgBlueTint, color: t.bluePrimary }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: t.textSecondary }}>
                    {addr.line1}
                  </p>
                  <p className="text-sm" style={{ color: t.textSecondary }}>
                    {addr.line2}
                  </p>
                  <p className="text-sm" style={{ color: t.textSecondary }}>
                    {addr.city}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      className="text-xs font-medium hover:underline"
                      style={{ color: t.bluePrimary }}
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        className="text-xs font-medium hover:underline"
                        style={{ color: t.textSecondary }}
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
