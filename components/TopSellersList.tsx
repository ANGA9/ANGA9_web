import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sellers = [
  {
    name: "Sharma Electricals",
    initials: "SE",
    category: "Electronics",
    revenue: 1245000,
    color: "#1A6FD4",
  },
  {
    name: "Gupta Textiles",
    initials: "GT",
    category: "Home Decor",
    revenue: 980000,
    color: "#374151",
  },
  {
    name: "Metro Mart",
    initials: "MM",
    category: "Retail",
    revenue: 875000,
    color: "#6B7280",
  },
  {
    name: "Prestige Interiors",
    initials: "PI",
    category: "Furniture",
    revenue: 720000,
    color: "#4B5563",
  },
  {
    name: "SafeHands India",
    initials: "SI",
    category: "Industrial",
    revenue: 650000,
    color: "#9CA3AF",
  },
];

function formatINR(value: number) {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`;
  return `\u20B9${value}`;
}

export default function TopSellersList() {
  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-anga-text">Top Sellers</h3>
        <button className="text-sm font-medium text-[#1A6FD4] hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {sellers.map((seller, index) => (
          <div
            key={seller.name}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-anga-bg/50 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-anga-text-secondary w-4">
              {index + 1}
            </span>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ backgroundColor: seller.color }}
              >
                {seller.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-anga-text truncate">
                {seller.name}
              </p>
              <span className="text-[10px] font-medium text-anga-text-secondary bg-anga-bg px-1.5 py-0.5 rounded">
                {seller.category}
              </span>
            </div>
            <p className="text-sm font-semibold text-anga-text shrink-0">
              {formatINR(seller.revenue)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
