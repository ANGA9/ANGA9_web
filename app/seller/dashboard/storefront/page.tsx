"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Eye, ExternalLink, Store, Globe, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  getStorefront,
  updateStorefrontSettings,
  type StorefrontUpdate,
} from "@/lib/sellersApi";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface SellerProfile {
  storefront_banner_url?: string | null;
  about_md?: string | null;
  storefront_published?: boolean;
  social_links?: Record<string, string> | null;
}

const SOCIAL_KEYS = ["website", "instagram", "facebook", "twitter", "linkedin"] as const;

export default function SellerStorefrontEditor() {
  const { dbUser } = useAuth();
  const sellerId = dbUser?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [aboutMd, setAboutMd] = useState("");
  const [published, setPublished] = useState(false);
  const [social, setSocial] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const profile = await api.get<{ seller_profile: SellerProfile } | SellerProfile>(
          `/api/users/seller-profile`,
          { silent: true },
        );
        if (cancelled) return;
        const p: SellerProfile =
          profile && typeof profile === "object" && "seller_profile" in profile
            ? (profile as { seller_profile: SellerProfile }).seller_profile
            : (profile as SellerProfile) ?? {};
        setBannerUrl(p?.storefront_banner_url ?? "");
        setAboutMd(p?.about_md ?? "");
        setPublished(!!p?.storefront_published);
        setSocial((p?.social_links ?? {}) as Record<string, string>);
      } catch {
        // If unpublished, public endpoint 404s — try silent then fall back to defaults
        try {
          const sf = await getStorefront(sellerId!);
          if (cancelled) return;
          setBannerUrl(sf.profile.storefront_banner_url ?? "");
          setAboutMd(sf.profile.about_md ?? "");
          setPublished(sf.profile.storefront_published);
          setSocial(sf.profile.social_links ?? {});
        } catch {
          /* defaults */
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  async function handleSave() {
    if (!sellerId) return;
    setSaving(true);
    try {
      const cleanedSocial: Record<string, string> = {};
      for (const k of SOCIAL_KEYS) {
        const v = (social[k] ?? "").trim();
        if (v) cleanedSocial[k] = v;
      }
      const body: StorefrontUpdate = {
        storefront_banner_url: bannerUrl.trim() || undefined,
        about_md: aboutMd.trim() || undefined,
        storefront_published: published,
        social_links: cleanedSocial,
      };
      await updateStorefrontSettings(body);
      toast.success("Storefront updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#9CA3AF]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A6FD4] mb-4" />
        <span className="text-[15px] font-medium">Loading storefront...</span>
      </div>
    );
  }

  return (
    <main className="w-full mx-auto max-w-5xl px-3 sm:px-4 py-6 md:px-8 md:py-10 bg-white md:bg-transparent min-h-[calc(100vh-64px)] text-[#1A1A2E]">
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">
            My Storefront
          </h1>
          <span className="text-[18px] font-bold text-gray-400">
            Customise your public seller page
          </span>
        </div>
        <div className="flex items-center gap-3">
          {published && sellerId && (
            <Link
              href={`/sellers/${sellerId}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-[14px] font-bold text-[#1A6FD4] hover:bg-gray-50 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4" /> View live <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2.5 rounded-full shadow-sm">
            <Store className="w-4 h-4 text-[#1A6FD4]" />
            Storefront
          </div>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Store className="w-6 h-6 text-[#1A6FD4]" /> My Storefront
        </h1>
        <p className="text-[14px] text-gray-500 font-medium">Customise your public seller page.</p>
        {published && sellerId && (
          <Link
            href={`/sellers/${sellerId}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-[14px] font-bold text-[#1A6FD4] mt-2 shadow-sm"
          >
            <Eye className="w-4 h-4" /> View live <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-1 max-w-3xl space-y-6 md:space-y-8">
          
          {/* ── Publishing Status ── */}
          <section className={`rounded-2xl border-2 p-6 md:p-8 transition-colors ${published ? "border-green-100 bg-green-50/50" : "border-gray-200 bg-white"}`}>
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:border-[#059669] checked:bg-[#059669] focus:outline-none focus:ring-4 focus:ring-[#059669]/20 transition-all cursor-pointer"
                />
                <Check className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
              </div>
              <div>
                <span className={`font-bold text-[16px] md:text-[18px] inline-flex items-center gap-2 transition-colors ${published ? "text-[#059669]" : "text-gray-900 group-hover:text-[#1A6FD4]"}`}>
                  <Globe className="w-5 h-5" /> Publish my storefront
                </span>
                <p className="text-[14px] text-gray-500 font-medium mt-1 leading-relaxed">
                  When enabled, your public storefront is visible to all customers on ANGA9.
                  <br />
                  <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 text-xs mt-1.5 inline-block">/sellers/{sellerId || "your-id"}</code>
                </p>
              </div>
            </label>
          </section>

          {/* ── Visuals & Bio ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              Visuals & Profile
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[15px] font-bold text-gray-900 mb-2">Banner image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
                />
                {bannerUrl ? (
                  <div className="mt-4 h-32 md:h-48 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="mt-4 h-32 md:h-48 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <Store className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[13px] font-medium">No banner image set</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[15px] font-bold text-gray-900 mb-2">About (plain text or markdown)</label>
                <textarea
                  value={aboutMd}
                  onChange={(e) => setAboutMd(e.target.value)}
                  maxLength={10000}
                  rows={8}
                  placeholder="Tell customers about your business, what you make, your story..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400 resize-y"
                />
                <div className="flex justify-end mt-2">
                  <span className="text-[13px] font-medium text-gray-400">{aboutMd.length} / 10000</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Social Links ── */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6">Social links <span className="text-gray-400 font-medium text-[14px] ml-1">(Optional)</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {SOCIAL_KEYS.map((k) => (
                <div key={k}>
                  <label className="block text-[14px] font-bold text-gray-700 mb-1.5 capitalize">
                    {k}
                  </label>
                  <input
                    type="url"
                    value={social[k] ?? ""}
                    onChange={(e) => setSocial((s) => ({ ...s, [k]: e.target.value }))}
                    placeholder={`https://${k}.com/yourbrand`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:bg-white focus:border-[#1A6FD4] focus:ring-4 focus:ring-[#1A6FD4]/10 transition-all shadow-sm placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── Mobile Save Button ── */}
          <div className="md:hidden pb-10 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-8 py-4 text-[16px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* ── Desktop Save Panel (Sticky) ── */}
        <div className="hidden md:block w-[300px] shrink-0">
          <div className="sticky top-[104px] flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Save your work</h3>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed">
                Changes will be visible on your public storefront immediately if published.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A6FD4] px-6 py-3.5 text-[15px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-[#155bb5] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
            
            <div className="bg-[#F8FBFF] rounded-3xl border border-blue-100 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#1A6FD4] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-1">Preview carefully</h3>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                    Make sure your banner image is high-resolution and your about text is clear and professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
