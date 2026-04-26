import { cn } from "@/lib/utils";

interface PortalBadgeProps {
  portal: "admin" | "seller" | "customer";
}

const config = {
  admin: { label: "Admin", bg: "bg-[#4338CA]/10", text: "text-[#4338CA]" },
  seller: { label: "Seller", bg: "bg-[#0F6E56]/10", text: "text-[#0F6E56]" },
  customer: { label: "Customer", bg: "bg-[#4338CA]/10", text: "text-[#4338CA]" },
};

export default function PortalBadge({ portal }: PortalBadgeProps) {
  const c = config[portal];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs md:text-sm font-semibold uppercase tracking-wider",
        c.bg,
        c.text
      )}
    >
      {c.label} Portal
    </span>
  );
}
