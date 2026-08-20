"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle2, MessageSquare, Info } from "lucide-react";
import { api } from "@/lib/api";
import { disputesApi, Dispute, DisputeType } from "@/lib/disputesApi";
import { pdcApi, PdcEligibilityResponse } from "@/lib/pdcApi";
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

const REASON_CODES = [
  { id: 'defective', label: "Item is defective or doesn't work" },
  { id: 'damaged', label: 'Item or packaging is damaged' },
  { id: 'wrong_item', label: 'Wrong item was sent' },
  { id: 'missing_parts', label: 'Missing parts or accessories' },
  { id: 'not_as_described', label: 'Item does not match description' },
  { id: 'no_longer_needed', label: 'No longer needed' }
];

export default function OrderDisputePage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);

  // Form state
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<DisputeType>("return");
  const [requestedQty, setRequestedQty] = useState(1);
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0].id);
  const [resolutionMode, setResolutionMode] = useState<'refund_source'|'refund_wallet'|'replace'>("refund_source");
  const [reason, setReason] = useState("");

  // PDC state
  const [showPdcModal, setShowPdcModal] = useState(false);
  const [pdcEligibility, setPdcEligibility] = useState<PdcEligibilityResponse | null>(null);
  const [pdcAccepting, setPdcAccepting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orderRes, disputeRes] = await Promise.all([
          api.get<OrderDetail>(`/api/orders/${id}`),
          disputesApi.getDisputesForOrder(id).catch(() => ({ items: [] })),
        ]);
        setOrder(orderRes);
        if (orderRes?.items?.[0]?.id) {
          setSelectedItemId(orderRes.items[0].id);
        }
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
    if (!order?.items || order.items.length === 0) return;
    const targetItemId = selectedItemId || order.items[0].id;
    const selectedItem = order.items.find(i => i.id === targetItemId) || order.items[0];

    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters");
      return;
    }

    try {
      setSubmitting(true);
      const res = await disputesApi.raiseDispute(id, {
        order_item_id: selectedItem.id,
        type,
        requested_qty: Math.min(requestedQty, selectedItem.quantity || 1),
        reason_code: reasonCode,
        resolution_mode: resolutionMode,
        reason: reason.trim(),
      });
      setDispute(res.dispute);
      setShowForm(false);
      
      // Check PDC eligibility
      try {
        const pdcRes = await pdcApi.checkEligibility(order.id, selectedItem.id, requestedQty);
        if (pdcRes.eligible) {
          setPdcEligibility(pdcRes);
          setShowPdcModal(true);
        } else {
          toast.success("Issue reported to seller successfully");
        }
      } catch (err) {
        toast.success("Issue reported to seller successfully");
      }
      
    } catch (err: any) {
      toast.error(err.message || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptPdc = async () => {
    if (!dispute) return;
    try {
      setPdcAccepting(true);
      await pdcApi.acceptCoins(dispute.id);
      toast.success(`₹${pdcEligibility?.total_coins} Coins credited to your wallet!`);
      setShowPdcModal(false);
      // reload dispute to get updated status
      const dRes = await disputesApi.getDisputesForOrder(id);
      if (dRes.items && dRes.items.length > 0) setDispute(dRes.items[0]);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept coins");
    } finally {
      setPdcAccepting(false);
    }
  };

  if (loading) {
    return (
      <>
        {/* ── Mobile Header ── */}
        <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
          <button onClick={() => window.history.back()} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
            Back to Orders
          </h1>
        </header>
        <div className="mx-auto max-w-4xl py-6 px-4 md:px-[26px] animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
            <div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-32 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-24 bg-gray-300 rounded-full" />
          </div>
          <div className="p-5 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1 py-1">
              <div className="h-5 w-3/4 bg-gray-300 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-40">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-5 w-48 bg-gray-300 rounded mx-auto mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
        </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        {/* ── Mobile Header ── */}
        <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
          <button onClick={() => window.history.back()} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
            Back to Orders
          </h1>
        </header>
        <div className="text-center py-20">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/orders" className="text-blue-600 mt-4 inline-block hover:underline">
          Back to Orders
        </Link>
        </div>
      </>
    );
  }

  const isCancelled = order.status === "cancelled";
  const selectedItem = order.items?.find((i) => i.id === selectedItemId) || order.items?.[0];

  return (
    <>
      {/* ── Mobile Header ── */}
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <button onClick={() => window.history.back()} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight flex-1">
          Back to Orders
        </h1>
      </header>

      <div className="mx-auto max-w-4xl py-6 px-4 md:px-[26px] relative">
      {/* PDC Modal */}
      {showPdcModal && pdcEligibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="from-amber-500 to-orange-500 p-6 text-center bg-white border-2 border-gradient-to-r text-gradient-to-r hover:bg-gray-50">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <span className="text-3xl">🪙</span>
              </div>
              <h2 className="text-2xl font-black mb-2">Wait! Want instant refund?</h2>
              <p className="text-amber-50 font-medium">Get your refund instantly in ANGA9 Coins + a 5% bonus.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <button 
                onClick={handleAcceptPdc}
                disabled={pdcAccepting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-4 rounded-xl font-bold flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">Accept ₹{pdcEligibility.total_coins} Coins</span>
                </div>
                <span className="text-xs text-amber-100 font-normal mt-0.5">Credited immediately to wallet (includes 5% bonus)</span>
                {pdcAccepting && (
                  <Loader2 className="w-4 h-4 animate-spin text-white mt-1" />
                )}
              </button>

              <button 
                onClick={() => {
                  setShowPdcModal(false);
                  toast.success("Issue reported. Refund will process normally.");
                }}
                disabled={pdcAccepting}
                className="w-full bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold flex flex-col items-center justify-center transition-all"
              >
                <span>Continue with cash refund</span>
                <span className="text-xs text-gray-500 font-normal mt-1">(Takes 4-8 business days to source account)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details</p>
            <h1 className="text-lg font-black text-gray-900">{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed on {new Date(order.placed_at).toLocaleDateString('en-US', { 
                day: 'numeric', month: 'short', year: 'numeric', 
                hour: 'numeric', minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-800">
              {order.status}
            </span>
          </div>
        </div>

        {order.items?.map((it) => (
          <div key={it.id} className="p-5 flex items-start gap-4 border-b border-gray-100 last:border-b-0">
            <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
              {it.product_image && (
                <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">{it.product_name}</h3>
              <p className="text-sm text-gray-500">Qty: {it.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {dispute ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Return / Issue Status
          </h2>

          {/* Status Timeline */}
          <div className="mb-8 relative pl-3">
            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-100" />
            <div className="space-y-6 relative">
              
              {/* Step 1: Raised */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${dispute ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Issue Raised</h4>
                  <p className="text-xs text-gray-500 mt-0.5">We have received your report.</p>
                </div>
              </div>

              {/* Step 2: Under Review (QC/Seller) */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${['seller_responded', 'admin_review', 'resolved_refund', 'resolved_replace', 'resolved_rejected', 'closed'].includes(dispute.status) ? 'bg-blue-600 text-white' : dispute.status === 'open' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Loader2 className={`w-4 h-4 ${dispute.status === 'open' ? 'text-blue-600 animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Under Review</h4>
                  <p className="text-xs text-gray-500 mt-0.5">The seller is reviewing your request.</p>
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${dispute.status.startsWith('resolved') || dispute.status === 'closed' ? (dispute.status === 'resolved_rejected' ? 'bg-red-600 text-white' : 'bg-green-600 text-white') : 'bg-gray-100 text-gray-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Resolved</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dispute.status === 'resolved_refund' ? 'Refund approved.' : dispute.status === 'resolved_replace' ? 'Replacement approved.' : dispute.status === 'resolved_rejected' ? 'Request was declined.' : 'Awaiting final resolution.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Issue Type</span>
              <span className="font-bold text-gray-900">{DISPUTE_TYPE_LABELS[dispute.type] || dispute.type}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Reason</span>
              <span className="font-medium text-gray-900">{dispute.reason}</span>
            </div>
            {dispute.seller_response && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Seller Response</p>
                <p className="text-sm text-gray-800">"{dispute.seller_response}"</p>
                {dispute.seller_responded_at && (
                  <p className="text-xs text-gray-400 mt-1">{new Date(dispute.seller_responded_at).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : showForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">Report an Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {order.items && order.items.length > 1 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Product with Issue</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setRequestedQty(1);
                  }}
                  className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
                >
                  {order.items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.product_name} (Qty: {it.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DisputeType)}
                  className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
                >
                  {Object.entries(DISPUTE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Quantity Affected</label>
                <select
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
                >
                  {Array.from({ length: selectedItem?.quantity || 1 }).map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason Code</label>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
              >
                {REASON_CODES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Preferred Resolution</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'refund_source', label: 'Refund to Original source' },
                  { id: 'refund_wallet', label: 'Refund to Wallet' },
                  { id: 'replace', label: 'Replacement' }
                ].map(rm => (
                  <label key={rm.id} className={`flex items-center justify-center p-3 text-sm border rounded-xl cursor-pointer transition-colors ${resolutionMode === rm.id ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" name="resolution_mode" value={rm.id} checked={resolutionMode === rm.id} onChange={(e) => setResolutionMode(e.target.value as any)} />
                    <span className="text-center">{rm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Additional Details</label>
              <textarea
                required
                minLength={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe the issue in detail (at least 5 characters)..."
                className="w-full rounded-xl border-gray-200 border p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                className="flex-1 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 text-sm disabled:opacity-70 bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Report to Seller
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          {!isCancelled ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-black text-gray-900 mb-2">Have a problem with this order?</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                If your item is damaged, defective, or not as described, you can report an issue directly to the seller.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors bg-[#1A6FD4] text-white hover:bg-[#1559B3] shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Issue
              </button>
            </>
          ) : (
            <div className="py-8">
              <p className="text-gray-500">This order has been cancelled.</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
