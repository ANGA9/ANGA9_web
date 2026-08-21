"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Mail,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Menu,
  Lock,
  Clock,
  FileText,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const DELETION_REASONS = [
  "Closing my business / store",
  "Switching to another platform",
  "Privacy / Personal data concerns",
  "Inactive store / No longer using the service",
  "Temporary hiatus",
  "Other",
];

export default function DataDeletionContent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(DELETION_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);

  const constructEmailBody = () => {
    return `Dear ANGA9 Data Protection & Grievance Team,

I am writing to formally request the permanent deletion of my ANGA9 Seller Account and all associated personal/store data under the Digital Personal Data Protection (DPDP) Act 2023 and Google Play Store Data Safety Policies.

Here are my registered account details:
----------------------------------------
- Registered Mobile Number: ${phoneNumber || "[Enter Mobile Number]"}
- Store / Business Name: ${storeName || "[Enter Store Name]"}
- Registered Email Address: ${email || "[Enter Registered Email]"}
- Reason for Deletion: ${reason}
- Additional Notes: ${additionalNotes || "N/A"}
----------------------------------------

I understand that active product listings and login access will be removed, and that statutory financial/tax records (such as GST invoices and TCS logs) will be retained for 8 years in compliance with Indian Law.

Please confirm receipt and acknowledge when the deletion process is complete.

Thank you,
${storeName || "ANGA9 Seller"}`;
  };

  const handleMailtoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error("Please enter your registered mobile number");
      return;
    }
    if (!agreed) {
      toast.error("Please acknowledge the account deletion terms");
      return;
    }

    const subject = encodeURIComponent(`Data Deletion Request - Seller: ${storeName || phoneNumber}`);
    const body = encodeURIComponent(constructEmailBody());
    const mailtoUrl = `mailto:team.anga9@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;
    toast.success("Opening your email client to send request to team.anga9@gmail.com");
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setCopied(true);
    toast.success("Email request template copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* ── Top Brand Bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              ANGA<span className="text-[#1A6FD4]">9</span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#1A6FD4] border border-blue-100">
              Seller Privacy
            </span>
          </Link>
          <div className="flex items-center gap-4 text-[13px] font-bold">
            <Link href="/privacy?audience=seller" className="text-slate-600 hover:text-[#1A6FD4] transition-colors hidden sm:block">
              Seller Privacy Policy
            </Link>
            <Link
              href="/seller/login"
              className="px-4 py-2 rounded-xl bg-[#1A6FD4] text-white hover:bg-[#1557AB] transition-colors shadow-sm"
            >
              Seller Portal
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200/60 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1A6FD4] text-[12px] font-bold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-4 h-4" />
            DPDP Act 2023 & Google Play Policy Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Seller Account & Data Deletion
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            At ANGA9, we respect your privacy and data autonomy. You have the right to permanently delete your seller profile, product catalog, and associated personal data at any time.
          </p>
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <main className="max-w-5xl mx-auto px-4 py-10 md:py-14 space-y-10">
        
        {/* ── 2 Methods Card Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ══════════ METHOD 1: IN-APP DELETION ══════════ */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1A6FD4]">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1A6FD4] bg-blue-50/80 px-2 py-0.5 rounded-md">
                    Method 1 • Instant
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                    In-App Deletion
                  </h2>
                </div>
              </div>

              <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                If you have the <strong>ANGA9 Seller App</strong> installed on your mobile phone, you can initiate immediate deletion directly within the application:
              </p>

              {/* Step By Step List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#1A6FD4] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Open ANGA9 Seller App</h4>
                    <p className="text-[13px] text-slate-500">Launch the mobile app and log in to your store.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#1A6FD4] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                      Click Left Navigation Menu <Menu className="w-4 h-4 text-slate-400 inline" />
                    </h4>
                    <p className="text-[13px] text-slate-500">Tap the hamburger menu icon in the top-left corner.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#1A6FD4] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Select "Data & Privacy"</h4>
                    <p className="text-[13px] text-slate-500">Navigate to the Data & Privacy section under account settings.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-red-600 shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900">Tap "Delete Seller Account"</h4>
                    <p className="text-[13px] text-slate-500">Type <code className="text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded">DELETE</code> to confirm permanent account closure.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/seller/dashboard/privacy"
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-[#1A6FD4] text-slate-700 hover:text-[#1A6FD4] font-bold text-[13px] flex items-center justify-center gap-2 transition-all bg-white hover:bg-blue-50/50"
              >
                Go to Web Dashboard Privacy Settings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>


          {/* ══════════ METHOD 2: ONLINE WEB REQUEST FORM ══════════ */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    Method 2 • Web & Email
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                    Request Deletion via Email
                  </h2>
                </div>
              </div>

              <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                Cannot access the app? Fill in your details below to dispatch a formal deletion notice directly to our Data Protection Officer at <strong className="text-slate-900">team.anga9@gmail.com</strong>:
              </p>

              <form onSubmit={handleMailtoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Store / Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vostro Apparel"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      placeholder="seller@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Reason for Deletion
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                  >
                    {DELETION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide any additional context or reference..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#1A6FD4] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[12px] text-slate-600 leading-normal">
                      I understand that active listings will be removed, pending orders/payouts must be settled, and GST invoices are preserved for 8 years per statutory regulations.
                    </span>
                  </label>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                  >
                    <Mail className="w-4 h-4" />
                    Send Request to team.anga9@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[13px] flex items-center justify-center gap-2 transition-all shrink-0"
                    title="Copy email text"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[12px] text-slate-400 font-medium">
                Official Contact: <a href="mailto:team.anga9@gmail.com" className="text-[#1A6FD4] font-bold hover:underline">team.anga9@gmail.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Data Safety & Retention Breakdown Card ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">What Happens When You Delete Your Account?</h3>
              <p className="text-[13px] text-slate-500 font-medium">Clear breakdown of data purged vs data retained under Indian statutory laws.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deleted Data */}
            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-[14px]">
                <Trash2 className="w-4 h-4" />
                Data Permanently Deleted / Anonymized:
              </div>
              <ul className="space-y-2 text-[13px] text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Store Catalog:</strong> All wholesale product listings, images, specifications, and SKU records are de-listed and deleted.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Credentials & Auth:</strong> Login password hashes, active sessions, and multi-factor auth tokens are revoked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Marketing & Push Tokens:</strong> FCM device tokens and promotional communication preferences are completely wiped.</span>
                </li>
              </ul>
            </div>

            {/* Retained Data */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-[#1A6FD4] font-bold text-[14px]">
                <FileText className="w-4 h-4" />
                Data Retained for Statutory Compliance:
              </div>
              <ul className="space-y-2 text-[13px] text-slate-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#1A6FD4] shrink-0 mt-0.5" />
                  <span><strong>Tax Invoices & GST E-Way Bills:</strong> Retained for <strong>8 years</strong> as mandated by Section 36 of the CGST Act 2017.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#1A6FD4] shrink-0 mt-0.5" />
                  <span><strong>Bank Disbursal & TCS Filings:</strong> Financial audit ledgers and Section 52 TCS returns are retained per RBI and Ministry of Finance mandates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#1A6FD4] shrink-0 mt-0.5" />
                  <span><strong>Dispute & Order Records:</strong> Commercial order records are archived in cold storage strictly for legal dispute defense.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-slate-600 flex items-center justify-between flex-wrap gap-3">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1A6FD4]" />
              Need assistance or tracking an existing deletion request?
            </span>
            <a
              href="mailto:team.anga9@gmail.com"
              className="text-[#1A6FD4] font-bold hover:underline inline-flex items-center gap-1"
            >
              Contact team.anga9@gmail.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}
