function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 10000 ? 0 : 500;
  const total = subtotal + gst + delivery;

  return (
    <div className="rounded-xl border border-anga-border bg-white p-6 sticky top-36">
      <h3 className="text-base font-semibold text-anga-text mb-4">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-anga-text-secondary">Subtotal</span>
          <span className="font-medium text-anga-text">
            {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-anga-text-secondary">GST (18%)</span>
          <span className="font-medium text-anga-text">{formatINR(gst)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-anga-text-secondary">Delivery</span>
          <span className="font-medium text-anga-text">
            {delivery === 0 ? "Free" : formatINR(delivery)}
          </span>
        </div>

        <div className="border-t border-anga-border pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-anga-text">
              Total
            </span>
            <span className="text-xl font-bold text-[#6C47FF]">
              {formatINR(total)}
            </span>
          </div>
        </div>
      </div>

      {delivery === 0 && (
        <p className="mt-3 text-xs text-[#22C55E] font-medium">
          Free delivery on orders above {"\u20B9"}10,000
        </p>
      )}

      <button className="mt-5 flex w-full items-center justify-center rounded-lg bg-[#6C47FF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5835DB] active:translate-y-px">
        Proceed to Checkout
      </button>

      <p className="mt-3 text-center text-[11px] text-anga-text-secondary">
        Prices are exclusive of GST. Business verification required.
      </p>
    </div>
  );
}
