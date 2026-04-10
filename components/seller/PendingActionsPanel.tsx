import { Truck, Tag, MessageSquare, AlertCircle } from "lucide-react";

const actions = [
  {
    icon: Truck,
    text: "2 orders need to be shipped",
    detail: "ORD-7291, ORD-7293",
    urgent: true,
  },
  {
    icon: Tag,
    text: "1 price update requested",
    detail: "Bluetooth Speaker X200",
    urgent: false,
  },
  {
    icon: MessageSquare,
    text: "1 review needs your response",
    detail: "3-star review on USB-C Hub",
    urgent: false,
  },
  {
    icon: AlertCircle,
    text: "1 product low on stock",
    detail: "USB-C Hub 7-in-1 (12 left)",
    urgent: true,
  },
];

export default function PendingActionsPanel() {
  return (
    <div className="rounded-xl border border-seller-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-anga-text">
          Pending Actions
        </h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444]/10 text-xs font-bold text-[#EF4444]">
          {actions.length}
        </span>
      </div>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg p-3 hover:bg-seller-bg transition-colors"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                action.urgent
                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                  : "bg-[#6C47FF]/10 text-[#6C47FF]"
              }`}
            >
              <action.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-anga-text">
                {action.text}
              </p>
              <p className="text-xs text-anga-text-secondary mt-0.5 truncate">
                {action.detail}
              </p>
            </div>
            <button className="shrink-0 text-xs font-medium text-[#6C47FF] hover:underline mt-0.5">
              Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
