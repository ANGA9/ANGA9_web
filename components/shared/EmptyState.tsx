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
  accentColor = "#6C47FF",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Icon className="h-8 w-8" style={{ color: accentColor }} />
      </div>
      <h3 className="text-base font-semibold text-anga-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-anga-text-secondary">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
