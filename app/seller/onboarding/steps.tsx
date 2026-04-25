"use client";
import { SellerFormData, BUSINESS_TYPES, INDIAN_STATES } from "./types";

type P = { form: SellerFormData; set: (k: keyof SellerFormData, v: any) => void };

const labelCls = "block text-sm md:text-base font-medium text-[#4B5563] mb-1.5";
const inputCls = "h-11 w-full rounded-lg border border-[#E8EEF4] bg-white px-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#1A6FD4] focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/10 transition-colors";
const selectCls = inputCls + " appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:20px] pr-10";

export function Step1({ form, set }: P) {
  return (
    <div className="space-y-5">
      <div><label className={labelCls}>Full Name *</label>
        <input className={inputCls} value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Enter your full name" /></div>
      <div><label className={labelCls}>Email Address *</label>
        <input className={inputCls} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" /></div>
      <div><label className={labelCls}>Phone Number</label>
        <div className="flex">
          <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-[#E8EEF4] bg-[#F8FBFF] text-sm text-[#4B5563] font-medium">+91</span>
          <input className={inputCls + " rounded-l-none"} type="tel" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" />
        </div></div>
    </div>
  );
}

export function Step2({ form, set }: P) {
  return (
    <div className="space-y-5">
      <div><label className={labelCls}>Business Name *</label>
        <input className={inputCls} value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="Your company or brand name" /></div>
      <div><label className={labelCls}>Business Type *</label>
        <select className={selectCls} value={form.business_type} onChange={e => set("business_type", e.target.value)}>
          <option value="">Select business type</option>
          {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select></div>
      <div><label className={labelCls}>Business Category</label>
        <input className={inputCls} value={form.business_category} onChange={e => set("business_category", e.target.value)} placeholder="e.g. Electronics, Fashion, Grocery" /></div>
      <div><label className={labelCls}>Store Description</label>
        <textarea className={inputCls + " h-24 py-3 resize-none"} value={form.store_description} onChange={e => set("store_description", e.target.value)} placeholder="Brief description of your business" /></div>
    </div>
  );
}

export function Step3({ form, set }: P) {
  return (
    <div className="space-y-5">
      <div><label className={labelCls}>Address Line 1 *</label>
        <input className={inputCls} value={form.address_line1} onChange={e => set("address_line1", e.target.value)} placeholder="Building, Street" /></div>
      <div><label className={labelCls}>Address Line 2</label>
        <input className={inputCls} value={form.address_line2} onChange={e => set("address_line2", e.target.value)} placeholder="Area, Landmark" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>City *</label>
          <input className={inputCls} value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" /></div>
        <div><label className={labelCls}>State *</label>
          <select className={selectCls} value={form.state} onChange={e => set("state", e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Pincode *</label>
          <input className={inputCls} value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit pincode" /></div>
        <div><label className={labelCls}>Country</label>
          <input className={inputCls} value={form.country} disabled /></div>
      </div>
    </div>
  );
}

export function Step4({ form, set }: P) {
  const masked = form.aadhaar_number ? form.aadhaar_number.replace(/(\d{4})(\d{4})(\d{0,4})/, "$1 $2 $3").trim() : "";
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-[#EAF2FF] border border-[#D0E3F7] px-3.5 py-3 text-sm md:text-base text-[#4B5563]">
        All KYC information is encrypted and stored securely. These fields are optional but recommended for faster verification.
      </div>
      <div><label className={labelCls}>GSTIN</label>
        <input className={inputCls} value={form.gstin} onChange={e => set("gstin", e.target.value.toUpperCase().slice(0, 15))} placeholder="e.g. 27AABCU9603R1ZM" maxLength={15} /></div>
      <div><label className={labelCls}>PAN Number</label>
        <input className={inputCls} value={form.pan_number} onChange={e => set("pan_number", e.target.value.toUpperCase().slice(0, 10))} placeholder="e.g. ABCDE1234F" maxLength={10} /></div>
      <div><label className={labelCls}>Aadhaar Number</label>
        <input className={inputCls} value={masked} onChange={e => set("aadhaar_number", e.target.value.replace(/\D/g, "").slice(0, 12))} placeholder="12-digit Aadhaar number" />
        <p className="text-xs md:text-sm text-[#9CA3AF] mt-1">Stored encrypted. Only last 4 digits visible after save.</p></div>
    </div>
  );
}

export function Step5({ form, set }: P) {
  async function fetchIFSC() {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bank_ifsc)) return;
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${form.bank_ifsc}`);
      if (res.ok) {
        const data = await res.json();
        set("bank_name", data.BANK || "");
        set("bank_branch", data.BRANCH || "");
      }
    } catch { /* ignore */ }
  }
  return (
    <div className="space-y-5">
      <div><label className={labelCls}>Account Holder Name *</label>
        <input className={inputCls} value={form.bank_account_name} onChange={e => set("bank_account_name", e.target.value)} placeholder="Name as per bank records" /></div>
      <div><label className={labelCls}>Account Number *</label>
        <input className={inputCls} type="password" value={form.bank_account_number} onChange={e => set("bank_account_number", e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="9-18 digit account number" /></div>
      <div><label className={labelCls}>Confirm Account Number *</label>
        <input className={inputCls} value={form.bank_account_confirm} onChange={e => set("bank_account_confirm", e.target.value.replace(/\D/g, "").slice(0, 18))} placeholder="Re-enter account number" /></div>
      <div><label className={labelCls}>IFSC Code *</label>
        <input className={inputCls} value={form.bank_ifsc} onChange={e => set("bank_ifsc", e.target.value.toUpperCase().slice(0, 11))} onBlur={fetchIFSC} placeholder="e.g. SBIN0001234" maxLength={11} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Bank Name</label>
          <input className={inputCls + " bg-[#F8FBFF]"} value={form.bank_name} readOnly placeholder="Auto-filled from IFSC" /></div>
        <div><label className={labelCls}>Branch</label>
          <input className={inputCls + " bg-[#F8FBFF]"} value={form.bank_branch} readOnly placeholder="Auto-filled from IFSC" /></div>
      </div>
    </div>
  );
}

export function Step6({ form, set }: P) {
  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 p-4 rounded-lg border border-[#E8EEF4] bg-white cursor-pointer hover:border-[#1A6FD4]/30 transition-colors">
        <input type="checkbox" checked={form.pickup_address_same} onChange={e => set("pickup_address_same", e.target.checked)} className="h-5 w-5 rounded border-[#E8EEF4] accent-[#1A6FD4]" />
        <div><p className="text-sm md:text-base font-medium text-[#1A1A2E]">Same as business address</p>
          <p className="text-xs md:text-sm text-[#9CA3AF]">Use the address entered in Step 3 as your pickup location</p></div>
      </label>
      {!form.pickup_address_same && (
        <div><label className={labelCls}>Pickup Address *</label>
          <textarea className={inputCls + " h-28 py-3 resize-none"} value={form.pickup_address} onChange={e => set("pickup_address", e.target.value)} placeholder="Full pickup address including pincode" /></div>
      )}
    </div>
  );
}

export function Step7({ form, onEdit }: { form: SellerFormData; onEdit: (step: number) => void }) {
  const Section = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
    <div className="border border-[#E8EEF4] rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-[#1A1A2E]">{title}</h3>
        <button onClick={() => onEdit(step)} className="text-xs md:text-sm font-semibold text-[#1A6FD4] hover:underline">Edit</button>
      </div>
      <div className="space-y-1.5 text-sm md:text-base text-[#4B5563]">{children}</div>
    </div>
  );
  const Row = ({ label, value }: { label: string; value: string }) => value ? (
    <div className="flex justify-between"><span className="text-[#9CA3AF]">{label}</span><span className="font-medium text-[#1A1A2E]">{value}</span></div>
  ) : null;

  return (
    <div>
      <div className="rounded-lg bg-[#EAF2FF] border border-[#D0E3F7] px-3.5 py-3 mb-5 text-sm md:text-base text-[#4B5563]">
        Please review all your details below. Click "Edit" on any section to make changes before submitting.
      </div>
      <Section title="Personal Details" step={0}>
        <Row label="Name" value={form.full_name} /><Row label="Email" value={form.email} /><Row label="Phone" value={form.phone ? `+91 ${form.phone}` : ""} />
      </Section>
      <Section title="Business Information" step={1}>
        <Row label="Business Name" value={form.business_name} /><Row label="Type" value={BUSINESS_TYPES.find(t => t.value === form.business_type)?.label || form.business_type} />
        <Row label="Category" value={form.business_category} />
      </Section>
      <Section title="Business Address" step={2}>
        <Row label="Address" value={[form.address_line1, form.address_line2].filter(Boolean).join(", ")} />
        <Row label="City / State" value={[form.city, form.state].filter(Boolean).join(", ")} />
        <Row label="Pincode" value={form.pincode} />
      </Section>
      <Section title="Tax & KYC" step={3}>
        <Row label="GSTIN" value={form.gstin} /><Row label="PAN" value={form.pan_number} />
        <Row label="Aadhaar" value={form.aadhaar_number ? `XXXX XXXX ${form.aadhaar_number.slice(-4)}` : ""} />
      </Section>
      <Section title="Bank Account" step={4}>
        <Row label="Account Holder" value={form.bank_account_name} />
        <Row label="Account No." value={form.bank_account_number ? `XXXX${form.bank_account_number.slice(-4)}` : ""} />
        <Row label="IFSC" value={form.bank_ifsc} /><Row label="Bank" value={form.bank_name} />
      </Section>
      <Section title="Pickup Address" step={5}>
        <Row label="Address" value={form.pickup_address_same ? "Same as business address" : form.pickup_address} />
      </Section>
    </div>
  );
}
