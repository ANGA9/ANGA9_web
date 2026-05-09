import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = "#4338CA",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 bg-white rounded-xl border-none col-span-12 w-full text-center">
      <Icon className="h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 text-gray-300" />
      <h3 className="text-[15px] md:text-[17px] font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[12px] md:text-[13px] text-gray-500 max-w-[260px] md:max-w-[320px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 md:mt-6 rounded-full md:rounded-xl px-6 py-2 md:px-8 md:py-3 text-[13px] md:text-[15px] font-semibold md:font-bold transition-all active:scale-95 shadow-sm md:shadow-md text-white"
          style={{ background: accentColor }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
