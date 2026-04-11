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
    <div className="rounded-xl border border-[#E5E0D8] bg-white p-6 sticky top-36">
      <h3 className="text-base font-semibold text-[#1C1917] mb-4">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#78716C]">Subtotal</span>
          <span className="font-medium text-[#1C1917]">
            {formatINR(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#78716C]">GST (18%)</span>
          <span className="font-medium text-[#1C1917]">{formatINR(gst)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#78716C]">Delivery</span>
          <span className="font-medium text-[#1C1917]">
            {delivery === 0 ? "Free" : formatINR(delivery)}
          </span>
        </div>

        <div className="border-t border-[#E5E0D8] pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-[#1C1917]">
              Total
            </span>
            <span className="text-xl font-medium text-[#1C1917]">
              {formatINR(total)}
            </span>
          </div>
        </div>
      </div>

      {delivery === 0 && (
        <p className="mt-3 text-xs text-[#0F6E56] font-medium">
          Free delivery on orders above {"\u20B9"}10,000
        </p>
      )}

      <button className="mt-5 flex w-full items-center justify-center rounded-lg bg-[#C4873A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B37530] active:translate-y-px">
        Proceed to Checkout
      </button>

      <p className="mt-3 text-center text-[11px] text-[#A8A09A]">
        Prices are exclusive of GST. Business verification required.
      </p>
    </div>
  );
}
