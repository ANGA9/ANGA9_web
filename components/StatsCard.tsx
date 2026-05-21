import { type LucideIcon } from "lucide-react";

interface Badge {
  text: string;
  label: string;
  type: "positive" | "negative";
}

interface StatsCardProps {
  title: string;
  value: string;
  badges: Badge[];
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function StatsCard({
  title,
  value,
  badges,
  icon: Icon,
  iconColor,
  iconBg,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
      {/* Decorative background blob */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-[0.15] transition-transform group-hover:scale-110" 
        style={{ backgroundColor: iconColor }}
      />
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center border"
          style={{ backgroundColor: iconBg, color: iconColor, borderColor: `${iconColor}33` }}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-[32px] font-bold text-gray-900 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
        
        <div className="flex items-center gap-2 mt-auto flex-wrap">
          {badges.map((badge, i) => {
            const isPositive = badge.type === "positive";
            return (
              <div key={i} className="flex items-center gap-1">
                {badge.text && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                      isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {badge.text}
                  </span>
                )}
                <span className="text-[12px] font-medium text-gray-500 truncate">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
