import { type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

export default function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = "#4338CA",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4 md:py-8 px-4 bg-white rounded-xl border-none col-span-12 w-full text-center">
      {illustration ? (
        illustration
      ) : Icon ? (
        <Icon className="h-10 w-10 md:h-12 md:w-12 mb-3 md:mb-4 text-gray-300" />
      ) : null}
      <h3 className="text-[18px] md:text-[22px] font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-[14px] md:text-[15px] text-gray-500 max-w-[260px] md:max-w-[340px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 md:mt-5 rounded-full md:rounded-xl px-8 py-3 md:px-10 md:py-3.5 text-[15px] md:text-[16px] font-semibold md:font-bold transition-all active:scale-95 shadow-sm md:shadow-md bg-white border-2 hover:bg-gray-50"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
