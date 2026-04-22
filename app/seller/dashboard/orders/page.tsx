"use client";
import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-[20px] font-bold text-[#1A1A2E] mb-1">Orders</h1>
      <p className="text-[13px] text-[#9CA3AF] mb-6">View orders containing your products</p>
      <div className="bg-white rounded-xl border border-[#E8EEF4] p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
        <h2 className="text-[16px] font-bold text-[#1A1A2E] mb-2">No Orders Yet</h2>
        <p className="text-[13px] text-[#9CA3AF]">Orders will appear here once customers purchase your products</p>
      </div>
    </div>
  );
}
