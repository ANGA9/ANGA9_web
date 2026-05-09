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
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border-none col-span-12 w-full text-center">
      <Icon className="h-12 w-12 mb-4 text-gray-300" />
      <h3 className="text-[17px] font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[13px] text-gray-500 max-w-[260px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 rounded-full px-6 py-2 text-[13px] font-semibold transition-all active:scale-95 shadow-sm text-white"
          style={{ background: accentColor }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
