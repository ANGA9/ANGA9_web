/**
 * Format a number as Indian Rupee with lakh/crore shorthand.
 */
export function formatINR(value: number, short = false): string {
  if (short) {
    if (value >= 10000000) return `\u20B9${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`;
  }
  return "\u20B9" + value.toLocaleString("en-IN");
}

/**
 * React component that renders a formatted INR value.
 */
export default function INRFormatter({
  value,
  short = false,
  className,
}: {
  value: number;
  short?: boolean;
  className?: string;
}) {
  return <span className={className}>{formatINR(value, short)}</span>;
}
