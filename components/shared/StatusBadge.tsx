import { cn } from "@/lib/utils";

type Status = "Delivered" | "Processing" | "Cancelled" | "Pending" | "Shipped" | "Active" | "Out of Stock" | "Low Stock" | "Pending Approval" | "Completed" | (string & {});

const styles: Record<string, string> = {
  Delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  Completed: "bg-[#22C55E]/10 text-[#22C55E]",
  Active: "bg-[#22C55E]/10 text-[#22C55E]",
  "In Stock": "bg-[#22C55E]/10 text-[#22C55E]",
  Processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Pending Approval": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Low Stock": "bg-[#F59E0B]/10 text-[#F59E0B]",
  Shipped: "bg-[#6C47FF]/10 text-[#6C47FF]",
  Cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
  "Out of Stock": "bg-[#EF4444]/10 text-[#EF4444]",
  Pending: "bg-[#6B7280]/10 text-[#6B7280]",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[status] ?? "bg-[#6B7280]/10 text-[#6B7280]",
        className
      )}
    >
      {status}
    </span>
  );
}
