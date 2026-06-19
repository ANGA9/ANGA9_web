"use client";

import { useEffect, useState } from "react";
import { loyaltyApi, type LoyaltyProfile } from "@/lib/loyaltyApi";
import { useAuth } from "@/lib/AuthContext";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";
import { Loader2, Crown, CheckCircle2, ShieldCheck, Zap, Truck, Package } from "lucide-react";
import toast from "react-hot-toast";
import Script from "next/script";
import { api } from "@/lib/api";

export default function MembershipPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    // Pre-fetch Razorpay Key ID
    api.get<{ razorpay?: { key_id: string } }>("/api/admin/config", { silent: true })
       .then(res => setRazorpayKeyId(res?.razorpay?.key_id || null))
       .catch(() => {});
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await loyaltyApi.getLoyaltyProfile();
      setProfile(data);
    } catch {
      toast.error("Failed to load membership details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }
    setPurchasing(plan);
    try {
      // 1. Create order
      const order = await loyaltyApi.purchaseMembership(plan);

      // 2. Open Razorpay
      const options = {
        key: razorpayKeyId || "rzp_test_fallback",
        amount: order.amount,
        currency: order.currency,
        name: "ANGA9+",
        description: `Subscription to ${plan.replace("_", " ")}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            const membership = await loyaltyApi.verifyMembership({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Welcome to ANGA9+!", { id: "payment-verify" });
            fetchProfile(); // Refresh
          } catch (err: any) {
            toast.error(err.message || "Failed to verify payment", { id: "payment-verify" });
          }
        },
        prefill: {
          name: (user as any)?.full_name || (user as any)?.first_name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: t.bluePrimary,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const activeMembership = profile?.membership;
  const isPlus = !!activeMembership;

  const features = [
    { icon: <Truck className="w-5 h-5 text-purple-600" />, title: "Free Shipping", desc: "No minimum order value" },
    { icon: <Zap className="w-5 h-5 text-amber-500" />, title: "Early Access", desc: "Get deals 24 hours before everyone else" },
    { icon: <Package className="w-5 h-5 text-green-600" />, title: "Priority Support", desc: "24/7 dedicated customer service" },
    { icon: <ShieldCheck className="w-5 h-5 text-blue-600" />, title: "Extended Returns", desc: "30-day return window" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">ANGA9+ Membership</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your premium membership and perks.</p>
      </div>

      {isPlus ? (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
            <Crown className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold mb-6">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Active Member
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">ANGA9+ {activeMembership.plan.includes('yearly') ? 'Yearly' : 'Monthly'}</h2>
            <p className="text-purple-200 font-medium max-w-md">
              You are currently enjoying all the premium perks of ANGA9+.
            </p>
            <div className="mt-8 bg-black/20 rounded-2xl p-5 backdrop-blur-sm max-w-sm border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200 text-sm">Status</span>
                <span className="text-green-400 font-bold uppercase tracking-wider text-xs">Active</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200 text-sm">Started On</span>
                <span className="font-medium text-white">{new Date(activeMembership.starts_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">Valid Until</span>
                <span className="font-medium text-white">{new Date(activeMembership.ends_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to ANGA9+</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Join the elite club and get exclusive access to premium perks, faster delivery, and priority support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border-2 border-gray-200 p-6 flex flex-col justify-between hover:border-purple-200 hover:bg-purple-50/30 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Monthly Plan</h3>
                <p className="text-sm text-gray-500">Billed every month</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-gray-900">₹99</span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe("plus_monthly")}
                disabled={purchasing !== null}
                className="w-full h-12 rounded-xl border-2 border-purple-600 text-purple-700 font-bold hover:bg-purple-50 transition-colors active:scale-[0.98] flex items-center justify-center"
              >
                {purchasing === "plus_monthly" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Monthly"}
              </button>
            </div>

            <div className="rounded-2xl border-2 border-purple-600 p-6 flex flex-col justify-between bg-purple-50/50 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                Best Value
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Yearly Plan</h3>
                <p className="text-sm text-gray-500">Billed once a year</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-gray-900">₹999</span>
                  <span className="text-gray-500 font-medium">/yr</span>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe("plus_yearly")}
                disabled={purchasing !== null}
                className="w-full h-12 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors active:scale-[0.98] shadow-md shadow-purple-600/20 flex items-center justify-center"
              >
                {purchasing === "plus_yearly" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Yearly"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">ANGA9+ Benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
