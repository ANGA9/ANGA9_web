"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  Clock,
  ArrowRight,
  Menu,
  CheckCircle2,
  Copy,
  ExternalLink,
  Building2,
  User,
  ShoppingBag,
  Store,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type AccountType = "customer" | "seller";

export default function AccountDeletionPortal() {
  const [accountType, setAccountType] = useState<AccountType>("seller");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSeller = accountType === "seller";

  const constructEmailBody = () => {
    return `Dear ANGA9 Data Protection & Grievance Team,

I am writing to formally request the permanent deletion of my ${isSeller ? "Seller Partner Account (ANGA9 Seller Hub)" : "Customer Account (ANGA9 B2B Shop)"} and all associated personal and telemetry data under India's Digital Personal Data Protection (DPDP) Act 2023 and Google Play User Data policies.

Account Details:
----------------------------------------
- Account Role: ${isSeller ? "Seller / Merchant Partner" : "Customer / B2B Buyer"}
- Registered Full Name / Business Name: ${fullName || "[Enter Full / Store Name]"}
- Registered Mobile Number: ${mobileNumber || "[Enter Mobile Number]"}
- Reason for Deletion: ${reason || "N/A"}
----------------------------------------

I understand that active sessions and account access will be revoked, and statutory financial records (such as tax invoices and GST TCS logs) are preserved for statutory compliance per Indian law.

Please confirm receipt and verify once my account and data have been purged.

Thank you,
${fullName || "ANGA9 User"}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your registered full name or store name");
      return;
    }
    if (!mobileNumber.trim()) {
      toast.error("Please enter your registered mobile number");
      return;
    }

    const subject = encodeURIComponent(
      `Account & Data Deletion Request - ${isSeller ? "Seller" : "Customer"}: ${fullName} (${mobileNumber})`
    );
    const body = encodeURIComponent(constructEmailBody());
    const mailtoUrl = `mailto:team.anga9@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
    setSubmitted(true);
    toast.success("Opening email client to send request to team.anga9@gmail.com");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setCopied(true);
    toast.success("Request template copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              ANGA<span className="text-[#1A6FD4]">9</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-[13px] font-bold text-slate-700 bg-white">
              <span>🇮🇳</span>
              <span>En</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <nav className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Legal</Link>
            <span>/</span>
            <span className="text-[#1A6FD4] font-bold">Account & Data Deletion</span>
          </nav>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1A6FD4] text-[11px] font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              DPDP Act 2023 Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              ANGA9 Wholesale Technologies Pvt. Ltd.
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Account & Personal Data Deletion Request
          </h1>
          <p className="mt-3 text-[15px] sm:text-[16px] text-slate-600 leading-relaxed max-w-3xl">
            In accordance with India's Digital Personal Data Protection (DPDP) Act and Google Play User Data policies, ANGA9 users and seller partners have the right to permanently delete their account and purge associated telemetry and personal identifiers.
          </p>
        </div>

        {/* ── Role Switcher Tabs & SLA ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                !isSeller
                  ? "bg-[#3730A3] text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              Customer Account (ANGA9)
            </button>
            <button
              type="button"
              onClick={() => setAccountType("seller")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                isSeller
                  ? "bg-[#3730A3] text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-4 h-4" />
              Partner Account (ANGA9 Seller Hub)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Purge SLA: <strong className="text-slate-700 font-bold">Within 7-30 Days</strong></span>
          </div>
        </div>

        {/* ── 2-Column Options Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* ══════════ OPTION 1 (INSTANT): In-App Self-Service ══════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                    OPTION 1 (INSTANT)
                  </span>
                  <h2 className="text-[18px] font-bold text-slate-900 leading-tight">
                    In-App Self-Service
                  </h2>
                </div>
              </div>

              <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                If you have the <strong>{isSeller ? "ANGA9 Seller Hub" : "ANGA9 Customer App"}</strong> mobile app installed on your phone, you can trigger immediate account deletion:
              </p>

              {/* 3 Step Sequence */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-[14px] text-slate-700">
                    Open <strong>{isSeller ? "ANGA9 Seller Hub" : "ANGA9 App"}</strong> and tap your <strong>{isSeller ? "Left Menu (☰)" : "Account / Profile"}</strong> tab.
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-[14px] text-slate-700">
                    Navigate to <strong>Settings → Data & Privacy</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-[14px] text-slate-700">
                    Tap <strong>Delete Account</strong> and confirm the verification dialog (type <code className="bg-red-50 text-red-600 font-bold px-1 py-0.5 rounded text-xs">DELETE</code>).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[13px] text-slate-600">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Session revoked instantly upon confirmation</span>
              </div>
            </div>
          </div>

          {/* ══════════ OPTION 2 (ONLINE REQUEST): Submit Web Deletion Request ══════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                    OPTION 2 (ONLINE REQUEST)
                  </span>
                  <h2 className="text-[18px] font-bold text-slate-900 leading-tight">
                    Submit Web Deletion Request
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    {isSeller ? "Registered Store / Full Name *" : "Registered Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isSeller ? "e.g. Vostro Apparel / Rahul Sharma" : "e.g. Rahul Sharma"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Let us know how we can improve..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white font-bold text-[14px] transition-all shadow-md shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Submit Deletion Request
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-3 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[13px] transition-colors shrink-0 flex items-center justify-center gap-1.5"
                    title="Copy request text"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-[12px] text-slate-400 font-medium">
                Sent directly to <a href="mailto:team.anga9@gmail.com" className="text-indigo-600 font-bold hover:underline">team.anga9@gmail.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer Information Card ── */}
        <div className="mt-8 p-6 rounded-3xl bg-white border border-slate-200 text-[13px] text-slate-600 leading-relaxed shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 text-[14px]">Statutory Retention Policy:</h3>
          <p>
            Upon receipt of a verified deletion request, profile information, catalog listings, and login credentials will be permanently erased. Tax invoices and statutory commercial records are preserved for 8 years in compliance with Section 36 of the CGST Act 2017 and Ministry of Finance mandates.
          </p>
        </div>
      </main>
    </div>
  );
}
