import { Upload } from "lucide-react";
import SellerHeader from "@/components/seller/SellerHeader";
import { Separator } from "@/components/ui/separator";

export default function SellerSettingsPage() {
  return (
    <div className="min-h-screen">
      <SellerHeader />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-anga-text">Store Settings</h1>
          <p className="text-sm text-anga-text-secondary">
            Manage your store profile and business details
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Store Logo */}
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <h3 className="text-base font-semibold text-anga-text mb-4">
              Store Logo
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#6C47FF]/10 text-[#6C47FF] font-bold text-2xl">
                RE
              </div>
              <div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-seller-border px-4 py-2.5 text-sm font-medium text-anga-text hover:bg-seller-bg transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </button>
                <p className="mt-2 text-xs text-anga-text-secondary">
                  PNG or JPG, max 2MB. Recommended 200x200px.
                </p>
              </div>
            </div>
          </div>

          {/* Store Profile */}
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <h3 className="text-base font-semibold text-anga-text mb-4">
              Store Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-anga-text">
                  Store Name
                </label>
                <input
                  type="text"
                  defaultValue="Rajesh Electronics"
                  className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-anga-text">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  defaultValue="Premium electronics and accessories wholesale dealer based in Mumbai. Serving businesses since 2015."
                  className="w-full rounded-lg border border-seller-border bg-seller-bg px-4 py-3 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="rajesh@electronics.in"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <h3 className="text-base font-semibold text-anga-text mb-4">
              Business Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-anga-text">
                  GST Number
                </label>
                <input
                  type="text"
                  defaultValue="27AABCU9603R1ZM"
                  className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                />
              </div>
              <Separator className="bg-seller-border" />
              <h4 className="text-sm font-semibold text-anga-text">
                Bank Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    defaultValue="HDFC Bank"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    Account Number
                  </label>
                  <input
                    type="text"
                    defaultValue="****4821"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    defaultValue="HDFC0001234"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-anga-text">
                    Account Holder
                  </label>
                  <input
                    type="text"
                    defaultValue="Rajesh Kumar"
                    className="h-11 w-full rounded-lg border border-seller-border bg-seller-bg px-4 text-sm text-anga-text focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button className="rounded-lg bg-[#6C47FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5835DB] transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
