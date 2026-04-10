import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  delta: string;
  deltaType: "positive" | "negative";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function StatsCard({
  title,
  value,
  delta,
  deltaType,
  icon: Icon,
  iconColor,
  iconBg,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-anga-border bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-anga-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-anga-text tracking-tight">{value}</p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              deltaType === "positive"
                ? "bg-[#22C55E]/10 text-[#22C55E]"
                : "bg-[#EF4444]/10 text-[#EF4444]"
            )}
          >
            {deltaType === "positive" ? "+" : ""}
            {delta}
          </span>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
