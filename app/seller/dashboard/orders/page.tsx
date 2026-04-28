"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, Package, Truck, CheckCircle2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
}

interface SellerOrder {
  id: string;
  order_number: string;
  status: string;
  placed_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get<{ orders: SellerOrder[] }>("/api/orders/seller");
      setOrders(res.orders || []);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      setUpdating(orderId);
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  function formatINR(value: number) {
    return "\u20B9" + value.toLocaleString("en-IN");
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] mb-1">Orders</h1>
      <p className="text-sm md:text-base text-[#9CA3AF] mb-6">Manage orders containing your products</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8EEF4] p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-[#E8EEF4] mx-auto mb-4" />
          <h2 className="text-base md:text-lg font-bold text-[#1A1A2E] mb-2">No Orders Yet</h2>
          <p className="text-sm md:text-base text-[#9CA3AF]">Orders will appear here once customers purchase your products</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EEF4] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E8EEF4]">
                <th className="py-3 px-4 text-sm md:text-base font-semibold text-[#1A1A2E]">Order Info</th>
                <th className="py-3 px-4 text-sm md:text-base font-semibold text-[#1A1A2E]">Products</th>
                <th className="py-3 px-4 text-sm md:text-base font-semibold text-[#1A1A2E]">Status</th>
                <th className="py-3 px-4 text-sm md:text-base font-semibold text-[#1A1A2E] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalAmount = order.items.reduce((sum, item) => sum + item.total_price, 0);
                const orderStatus = order.items[0]?.status || order.status;
                return (
                  <tr key={order.id} className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <Link href={`/seller/dashboard/orders/${order.id}`} className="text-sm md:text-base font-bold text-[#1A6FD4] hover:underline">{order.order_number}</Link>
                      <p className="text-xs md:text-sm text-[#6B7280] mt-1">
                        {new Date(order.placed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                      <p className="text-sm md:text-base font-semibold text-[#1A6FD4] mt-2">
                        {formatINR(totalAmount)}
                      </p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm md:text-base">
                            <span className="font-medium text-[#1A1A2E]">{item.product_name}</span>
                            <span className="text-[#6B7280] ml-2">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs md:text-sm font-medium capitalize ${
                        orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <Link
                          href={`/seller/dashboard/orders/${order.id}`}
                          className="flex items-center justify-center gap-2 bg-[#EAF2FF] hover:bg-[#D6E8FF] text-[#1A6FD4] text-xs md:text-sm font-semibold py-1.5 px-3 rounded-lg transition-colors w-[130px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </Link>
                        {orderStatus === 'confirmed' && (
                          <button
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'processing')}
                            className="flex items-center justify-center gap-2 bg-[#FFCC00] hover:bg-[#F5B800] text-[#1A1A2E] text-xs md:text-sm font-bold py-1.5 px-3 rounded-lg transition-colors w-[130px] disabled:opacity-50"
                          >
                            {updating === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                            Mark Processing
                          </button>
                        )}
                        {orderStatus === 'processing' && (
                          <button
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'shipped')}
                            className="flex items-center justify-center gap-2 bg-[#1A6FD4] hover:bg-[#155AB0] text-white text-xs md:text-sm font-bold py-1.5 px-3 rounded-lg transition-colors w-[130px] disabled:opacity-50"
                          >
                            {updating === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                            Mark Shipped
                          </button>
                        )}
                        {orderStatus === 'shipped' && (
                          <button
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, 'delivered')}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-bold py-1.5 px-3 rounded-lg transition-colors w-[130px] disabled:opacity-50"
                          >
                            {updating === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
