"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2, MessageSquare, Info } from "lucide-react";
import { api } from "@/lib/api";
import { disputesApi, Dispute, DisputeType } from "@/lib/disputesApi";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import toast from "react-hot-toast";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  placed_at: string;
  delivered_at?: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    product_image?: string;
  }[];
}

const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  return: "Return",
  refund: "Refund",
  wrong_item: "Wrong Item Received",
  damaged: "Damaged Item",
  not_received: "Item Not Received",
  other: "Other",
};

export default function OrderDisputePage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<DisputeType>("return");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orderRes, disputeRes] = await Promise.all([
          api.get<OrderDetail>(`/api/orders/${id}`),
          disputesApi.getDisputesForOrder(id).catch(() => ({ items: [] })),
        ]);
        setOrder(orderRes);
        if (disputeRes.items && disputeRes.items.length > 0) {
          setDispute(disputeRes.items[0]);
        }
      } catch (err) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.items?.[0]) return;
    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters");
      return;
    }

    try {
      setSubmitting(true);
      const res = await disputesApi.raiseDispute(id, {
        order_item_id: order.items[0].id,
        type,
        reason: reason.trim(),
      });
      setDispute(res.dispute);
      setShowForm(false);
      toast.success("Issue reported successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: t.bluePrimary }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/orders" className="text-blue-600 mt-4 inline-block hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === "delivered";
  const item = order.items?.[0];

  return (
    <div className="mx-auto max-w-2xl py-6 px-4 md:px-0">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details</p>
            <h1 className="text-lg font-black text-gray-900">{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {new Date(order.placed_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-800">
              {order.status}
            </span>
          </div>
        </div>

        {item && (
          <div className="p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">{item.product_name}</h3>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
        )}
      </div>

      {dispute ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Reported Issue
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-bold text-gray-900 mb-1">Issue Reported ({DISPUTE_TYPE_LABELS[dispute.type]})</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">"{dispute.reason}"</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(dispute.created_at).toLocaleString()}</p>
              </div>
            </div>

            {dispute.seller_response && (
              <div className="flex gap-4">
                <div className="w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                  </div>
                  {(dispute.admin_resolution || dispute.status.startsWith('resolved')) && (
                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-bold text-gray-900 mb-1">Seller Responded</p>
                  <p className="text-sm text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100 mt-2">"{dispute.seller_response}"</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(dispute.seller_responded_at!).toLocaleString()}</p>
                </div>
              </div>
            )}

            {(dispute.admin_resolution || dispute.status.startsWith('resolved')) && (
              <div className="flex gap-4">
                <div className="w-8 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Resolved ({dispute.status.replace('resolved_', '').toUpperCase()})</p>
                  {dispute.admin_resolution && (
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100 mt-2">"{dispute.admin_resolution}"</p>
                  )}
                  {dispute.admin_resolved_at && (
                    <p className="text-xs text-gray-400 mt-2">{new Date(dispute.admin_resolved_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Report an Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DisputeType)}
                className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                {Object.entries(DISPUTE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Details</label>
              <textarea
                required
                minLength={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe the issue in detail..."
                className="w-full rounded-xl border-gray-200 border p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-70"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          {isDelivered ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-black text-gray-900 mb-2">Have a problem with this order?</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                If your item is damaged, defective, or not as described, you can report an issue to the seller.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Issue
              </button>
            </>
          ) : (
            <div className="py-8">
              <p className="text-gray-500">You can report issues after the order has been delivered.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
