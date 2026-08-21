"use client";

import { useState } from "react";
import LegalLayout from "@/components/legal/LegalLayout";
import { useLegalAudience } from "@/lib/legalAudience";
import { useLang } from "@/lib/i18n";
import {
  Smartphone,
  Mail,
  Lock,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  AlertTriangle,
  FileText,
  Trash2,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AccountDeletionPortal() {
  const { audience } = useLegalAudience();
  const { lang } = useLang();
  const isSeller = audience === "seller";
  const dir = lang === "ur" ? "rtl" : "ltr";

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);

  const constructEmailBody = () => {
    return `Dear ANGA9 Data Protection & Grievance Team,

I am writing to formally request the permanent deletion of my ${isSeller ? "Seller / Merchant Partner Account (ANGA9 Seller Hub)" : "Customer Account (ANGA9 B2B Shop)"} and all associated personal and store data under India's Digital Personal Data Protection (DPDP) Act 2023 and Google Play User Data policies.

Account Details:
----------------------------------------
- Account Type: ${isSeller ? "Seller / Merchant Partner" : "Customer / B2B Buyer"}
- Registered Full Name / Business Name: ${fullName || "[Enter Full / Store Name]"}
- Registered Mobile Number: ${mobileNumber || "[Enter Mobile Number]"}
- Reason for Deletion: ${reason || "N/A"}
----------------------------------------

I understand that active sessions and account access will be revoked, and statutory financial records (such as tax invoices and GST TCS logs) are preserved for 8 years in compliance with Indian Law.

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
    toast.success("Opening email client to send request to team.anga9@gmail.com");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(constructEmailBody());
    setCopied(true);
    toast.success("Request template copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <LegalLayout
      title={isSeller ? "Seller Account & Data Deletion" : "Account & Data Deletion"}
      lastUpdated={isSeller ? "August 15, 2026" : "May 5, 2026"}
    >
      <div dir={dir} className="space-y-8 text-gray-700 leading-relaxed">
        {/* Intro */}
        <p className="text-[15px] leading-relaxed">
          ANGA9 (“we”, “us”, “our”) respects your privacy and is committed to protecting the personal information you share with us. In accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023 and Google Play User Data policies, {isSeller ? "seller partners and merchants" : "customers and buyers"} have the right to permanently delete their account and purge associated telemetry and personal identifiers at any time.
        </p>

        {/* ── Section 1: Deletion Methods ── */}
        <div>
          <h2 className="text-[20px] font-black text-gray-900 flex items-center mb-6 pt-2">
            <span className="inline-block w-1.5 h-5 bg-[#1A6FD4] rounded-full mr-2.5" />
            1. Account & Data Deletion Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
            {/* ══════════ OPTION 1: IN-APP SELF-SERVICE ══════════ */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1A6FD4]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1A6FD4]">
                      OPTION 1 (INSTANT)
                    </span>
                    <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                      In-App Self-Service
                    </h3>
                  </div>
                </div>

                <p className="text-[13px] text-gray-600 mb-5 leading-normal">
                  If you have the <strong>{isSeller ? "ANGA9 Seller Hub" : "ANGA9 App"}</strong> mobile app installed on your phone, you can trigger immediate account deletion:
                </p>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[11px] text-[#1A6FD4] shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-[13px] text-gray-700">
                      Open <strong>{isSeller ? "ANGA9 Seller Hub" : "ANGA9"}</strong> and tap your <strong>{isSeller ? "Left Menu (☰)" : "Profile / Account"}</strong> tab.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[11px] text-[#1A6FD4] shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-[13px] text-gray-700">
                      Navigate to <strong>Settings → Data & Privacy</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[11px] text-[#1A6FD4] shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-[13px] text-gray-700">
                      Tap <strong>Delete Account</strong> and confirm the verification dialog (type <code className="bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded text-xs">DELETE</code>).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200/60">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200 text-[12px] text-gray-600">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Session and auth tokens revoked instantly upon confirmation</span>
                </div>
              </div>
            </div>

            {/* ══════════ OPTION 2: SUBMIT WEB DELETION REQUEST ══════════ */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1A6FD4]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1A6FD4]">
                      OPTION 2 (ONLINE REQUEST)
                    </span>
                    <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                      Submit Web Deletion Request
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      {isSeller ? "Registered Store / Full Name *" : "Registered Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isSeller ? "e.g. Vostro Apparel / Rahul Sharma" : "e.g. Rahul Sharma"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      Registered Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-300 bg-white text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1">
                      Reason for Deletion (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Let us know how we can improve..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#1A6FD4] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1A6FD4] hover:bg-[#1557AB] text-white font-bold text-[13px] transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Submit Deletion Request
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="py-2.5 px-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[12px] transition-colors shrink-0 flex items-center justify-center gap-1.5"
                      title="Copy email text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60 text-center">
                <p className="text-[11px] text-gray-500 font-medium">
                  Sent directly to <a href="mailto:team.anga9@gmail.com" className="text-[#1A6FD4] font-bold hover:underline">team.anga9@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Statutory Retention ── */}
        <div>
          <h2 className="text-[20px] font-black text-gray-900 flex items-center mb-4 pt-2">
            <span className="inline-block w-1.5 h-5 bg-[#1A6FD4] rounded-full mr-2.5" />
            2. Data Purge & Statutory Retention Lifecycle
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[14px]">
            <li><strong>Immediate Data Purge:</strong> Upon verified account deletion, personal profile identifiers, catalog listings, addresses, notification tokens, and authentication credentials are permanently deleted from active systems.</li>
            <li><strong>Financial & Tax Compliance Retention:</strong> In compliance with Section 36 of the Central Goods and Services Tax (CGST) Act 2017 and the Companies Act 2013, tax invoices, GST TCS monthly filings, e-way bills, and bank payment disbursal ledgers are retained securely in cold storage for a statutory period of <strong>8 years</strong>, after which they are permanently purged.</li>
            <li><strong>Processing Timeline:</strong> In-app deletion takes effect immediately. Web and email deletion requests are acknowledged within 24 hours and completed within <strong>7 to 30 days</strong>.</li>
          </ul>
        </div>

        {/* ── Section 3: Grievance Officer & Official Contact ── */}
        <div>
          <h2 className="text-[20px] font-black text-gray-900 flex items-center mb-4 pt-2">
            <span className="inline-block w-1.5 h-5 bg-[#1A6FD4] rounded-full mr-2.5" />
            3. Grievance Officer & Contact Details
          </h2>
          <p className="text-[14px] mb-3">
            If you have questions regarding account deletion or wish to follow up on a submitted request, please contact our designated Grievance & Data Protection Cell:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]">
            <li><strong>Official Email:</strong> <a href="mailto:team.anga9@gmail.com" className="text-[#1A6FD4] font-bold hover:underline">team.anga9@gmail.com</a> / <a href="mailto:support@anga9.com" className="text-[#1A6FD4] font-bold hover:underline">support@anga9.com</a></li>
            <li><strong>Designated Officer:</strong> Legal & Compliance Officer, ANGA9 Wholesale Technologies Pvt. Ltd.</li>
            <li><strong>Registered Office:</strong> ANGA9 Wholesale Technologies Pvt. Ltd., Tech Park Road, Whitefield, Bengaluru, Karnataka 560066, India.</li>
          </ul>
        </div>
      </div>
    </LegalLayout>
  );
}
