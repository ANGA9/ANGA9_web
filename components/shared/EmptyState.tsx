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
    <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-xl border-none col-span-12 w-full text-center">
      <Icon className="h-16 w-16 mb-6 text-gray-300" />
      <h3 className="text-xl font-black text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-[15px] text-gray-500">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-8 rounded-xl px-10 py-3.5 text-[16px] font-black transition-all active:scale-95 shadow-lg shadow-indigo-100 text-white"
          style={{ background: accentColor }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
