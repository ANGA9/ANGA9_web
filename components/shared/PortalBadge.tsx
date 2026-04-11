import { cn } from "@/lib/utils";

interface PortalBadgeProps {
  portal: "admin" | "seller" | "customer";
}

const config = {
  admin: { label: "Admin", bg: "bg-[#6C47FF]/10", text: "text-[#6C47FF]" },
  seller: { label: "Seller", bg: "bg-[#0F6E56]/10", text: "text-[#0F6E56]" },
  customer: { label: "Customer", bg: "bg-[#6C47FF]/10", text: "text-[#6C47FF]" },
};

export default function PortalBadge({ portal }: PortalBadgeProps) {
  const c = config[portal];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        c.bg,
        c.text
      )}
    >
      {c.label} Portal
    </span>
  );
}
