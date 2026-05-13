"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Eye, ExternalLink, Store, Globe } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A6FD4]" />
      </div>
    );
  }

  return (
    <main className="p-6 xl:p-8 max-w-4xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-anga-text flex items-center gap-2">
            <Store size={22} /> My Storefront
          </h1>
          <p className="text-sm md:text-base text-anga-text-secondary">
            Customise your public seller page on ANGA9.
          </p>
        </div>
        {published && sellerId && (
          <Link
            href={`/sellers/${sellerId}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8EEF4] px-4 py-2 text-sm font-semibold text-[#1A6FD4] hover:bg-[#F8FBFF]"
          >
            <Eye size={14} /> View live <ExternalLink size={12} />
          </Link>
        )}
      </header>

      <section className="bg-white rounded-2xl border border-[#E8EEF4] p-5 md:p-6 mb-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="mt-1 w-5 h-5"
          />
          <div>
            <span className="font-semibold text-anga-text inline-flex items-center gap-2">
              <Globe size={14} /> Publish my storefront
            </span>
            <p className="text-xs md:text-sm text-anga-text-secondary mt-0.5">
              When enabled, your public storefront is visible at <code>/sellers/{sellerId}</code>.
            </p>
          </div>
        </label>
      </section>

      <section className="bg-white rounded-2xl border border-[#E8EEF4] p-5 md:p-6 mb-5 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-anga-text mb-1">Banner image URL</label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-[#E8EEF4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20"
          />
          {bannerUrl && (
            <div className="mt-3 h-32 md:h-40 rounded-lg overflow-hidden border border-[#E8EEF4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-anga-text mb-1">About (plain text or markdown)</label>
          <textarea
            value={aboutMd}
            onChange={(e) => setAboutMd(e.target.value)}
            maxLength={10000}
            rows={8}
            placeholder="Tell customers about your business, what you make, your story..."
            className="w-full rounded-lg border border-[#E8EEF4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20 resize-y"
          />
          <p className="text-xs text-anga-text-secondary mt-1">{aboutMd.length} / 10000</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E8EEF4] p-5 md:p-6 mb-5">
        <h2 className="font-semibold text-anga-text mb-3">Social links (optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOCIAL_KEYS.map((k) => (
            <div key={k}>
              <label className="block text-xs font-medium text-anga-text-secondary mb-1 capitalize">
                {k}
              </label>
              <input
                type="url"
                value={social[k] ?? ""}
                onChange={(e) => setSocial((s) => ({ ...s, [k]: e.target.value }))}
                placeholder={`https://${k}.com/yourbrand`}
                className="w-full rounded-lg border border-[#E8EEF4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6FD4]/20"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1A6FD4] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#155CB0] disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save changes
        </button>
      </div>
    </main>
  );
}
