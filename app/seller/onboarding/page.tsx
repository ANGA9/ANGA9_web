"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Loader2, Send } from "lucide-react";
import { SellerFormData, INITIAL_FORM, STEP_TITLES, validateStep } from "./types";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./steps";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OnboardingPage() {
  const { user, session, loading: authLoading, getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SellerFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const setField = useCallback((k: keyof SellerFormData, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors([]);
  }, []);

  // Load existing profile on mount
  useEffect(() => {
    if (authLoading || !session) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API}/api/users/seller-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const { sellerProfile } = await res.json();
        if (sellerProfile) {
          setProfileExists(true);
          if (sellerProfile.onboarding_complete) {
            window.location.href = "/seller/dashboard";
            return;
          }
          setStep(sellerProfile.onboarding_step || 0);
          setForm(prev => ({
            ...prev,
            business_name: sellerProfile.business_name || "",
            business_type: sellerProfile.business_type || "",
            business_category: sellerProfile.business_category || "",
            store_description: sellerProfile.store_description || "",
            address_line1: sellerProfile.address_line1 || "",
            address_line2: sellerProfile.address_line2 || "",
            city: sellerProfile.city || "",
            state: sellerProfile.state || "",
            pincode: sellerProfile.pincode || "",
            country: sellerProfile.country || "India",
            gstin: sellerProfile.gstin || "",
            pan_number: sellerProfile.pan_number || "",
            aadhaar_number: sellerProfile.aadhaar_number || "",
            bank_account_name: sellerProfile.bank_account_name || "",
            bank_account_number: sellerProfile.bank_account_number || "",
            bank_account_confirm: sellerProfile.bank_account_number || "",
            bank_ifsc: sellerProfile.bank_ifsc || "",
            bank_name: sellerProfile.bank_name || "",
            bank_branch: sellerProfile.bank_branch || "",
            pickup_address_same: sellerProfile.pickup_address_same ?? true,
            pickup_address: sellerProfile.pickup_address || "",
          }));
        }
        // Pre-fill from auth user
        if (user) {
          setForm(prev => ({
            ...prev,
            email: prev.email || user.email || "",
            full_name: prev.full_name || (user.user_metadata?.full_name as string) || "",
          }));
        }
      } catch { /* ignore */ }
      setLoaded(true);
    })();
  }, [authLoading, session, user, getToken]);

  async function saveProgress() {
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      const payload: Record<string, unknown> = {
        business_name: form.business_name,
        business_type: form.business_type || undefined,
        business_category: form.business_category || undefined,
        store_description: form.store_description || undefined,
        address_line1: form.address_line1 || undefined,
        address_line2: form.address_line2 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        country: form.country || undefined,
        gstin: form.gstin || undefined,
        pan_number: form.pan_number || undefined,
        aadhaar_number: form.aadhaar_number || undefined,
        bank_account_name: form.bank_account_name || undefined,
        bank_account_number: form.bank_account_number || undefined,
        bank_ifsc: form.bank_ifsc || undefined,
        bank_name: form.bank_name || undefined,
        bank_branch: form.bank_branch || undefined,
        pickup_address_same: form.pickup_address_same,
        pickup_address: form.pickup_address || undefined,
        onboarding_step: step,
      };

      if (!profileExists) {
        const res = await fetch(`${API}/api/users/seller-profile`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok || res.status === 409) setProfileExists(true);
      } else {
        await fetch(`${API}/api/users/seller-profile`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  function handleNext() {
    if (step < 6) {
      const errs = validateStep(step, form);
      if (errs.length) { setErrors(errs); return; }
      setErrors([]);
      const next = step + 1;
      setStep(next);
      saveProgress();
    }
  }

  function handlePrev() {
    if (step > 0) { setErrors([]); setStep(step - 1); }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await saveProgress();
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API}/api/users/seller-profile/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        window.location.href = "/seller/dashboard";
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  if (authLoading || !loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  const stepContent = [
    <Step1 key={0} form={form} set={setField} />,
    <Step2 key={1} form={form} set={setField} />,
    <Step3 key={2} form={form} set={setField} />,
    <Step4 key={3} form={form} set={setField} />,
    <Step5 key={4} form={form} set={setField} />,
    <Step6 key={5} form={form} set={setField} />,
    <Step7 key={6} form={form} onEdit={(s) => setStep(s)} />,
  ];

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:py-12">
      {/* Progress stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-[#1A6FD4]">
            Step {step + 1} of 7
          </p>
          <p className="text-[13px] text-[#9CA3AF]">{STEP_TITLES[step]}</p>
        </div>
        <div className="flex gap-1.5">
          {STEP_TITLES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-[#22C55E]" : i === step ? "bg-[#1A6FD4]" : "bg-[#E8EEF4]"
              }`}
            />
          ))}
        </div>
        {/* Step circles - desktop */}
        <div className="hidden sm:flex items-center justify-between mt-4">
          {STEP_TITLES.map((title, i) => (
            <button
              key={i}
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex flex-col items-center gap-1.5 group ${i <= step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                i < step ? "bg-[#22C55E] text-white" : i === step ? "bg-[#1A6FD4] text-white ring-4 ring-[#1A6FD4]/20" : "bg-[#E8EEF4] text-[#9CA3AF]"
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium max-w-[70px] text-center leading-tight ${
                i <= step ? "text-[#1A1A2E]" : "text-[#9CA3AF]"
              }`}>{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#E8EEF4] shadow-[0_4px_24px_rgba(26,111,212,0.06)] p-6 sm:p-8">
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1A1A2E] mb-1">
          {STEP_TITLES[step]}
        </h2>
        <p className="text-[13px] text-[#9CA3AF] mb-6">
          {step === 6 ? "Review your information before submitting" : "Fill in the details below to continue"}
        </p>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            {errors.map((e, i) => (
              <p key={i} className="text-[13px] text-red-600">{e}</p>
            ))}
          </div>
        )}

        {/* Step content */}
        {stepContent[step]}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="flex items-center gap-1.5 h-11 px-5 rounded-lg border border-[#E8EEF4] text-[14px] font-semibold text-[#4B5563] hover:border-[#1A6FD4] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={saveProgress}
          disabled={saving}
          className="flex items-center gap-1.5 h-11 px-5 rounded-lg border border-[#E8EEF4] text-[14px] font-semibold text-[#4B5563] hover:border-[#1A6FD4] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>

        {step < 6 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 h-11 px-6 rounded-lg bg-[#1A6FD4] text-[14px] font-semibold text-white hover:bg-[#155bb5] shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 h-11 px-6 rounded-lg bg-[#6C47FF] text-[14px] font-semibold text-white hover:bg-[#5A3AE0] shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit for Verification
          </button>
        )}
      </div>
    </div>
  );
}
