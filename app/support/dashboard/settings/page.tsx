"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import { User, Bell, ShieldCheck, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.getSession();

        const res = await api.get<{ user: Profile }>("/api/users/profile");
        if (!active) return;
        
        const p = res.user;
        setProfile(p);
        setDisplayName(p?.full_name || `Support ${p?.id?.slice(0, 4).toUpperCase() || ""}`);
      } catch {
        if (active) toast.error("Failed to load your profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      toast.error("Display name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch<{ user: Profile }>("/api/users/profile", {
        full_name: trimmed,
      });
      const updated = res.user;
      setProfile(updated);
      setDisplayName(updated.full_name || trimmed);
      toast.success("Display name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const initial = (profile?.full_name || profile?.email || "?").charAt(0).toUpperCase();
  const dirty = displayName.trim() !== (profile?.full_name || "");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agent Settings</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your profile and notification preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-black shadow-sm">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : initial !== "?" ? initial : <User />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile ? (profile.full_name || `Support ${profile.id.slice(0, 4).toUpperCase()}`) : "Loading..."}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-bold text-gray-500">Verified Support Agent</span>
            </div>
          </div>
        </div>

        {/* Display name — shown on the leaderboard and to teammates */}
        <form onSubmit={handleSave} className="p-6 space-y-4 border-b border-gray-100">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-1.5">Display Name</label>
            <p className="text-sm text-gray-500 mb-3">
              This is how you appear on the leaderboard and to your teammates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 60))}
                placeholder="e.g. Priya from Support"
                disabled={loading}
                className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[15px] font-medium text-gray-900 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-colors placeholder:text-gray-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={saving || loading || !dirty || displayName.trim().length < 2}
                className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="p-6 space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">Preferences (Coming Soon)</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-bold text-gray-900">Browser Notifications</p>
                  <p className="text-sm text-gray-500">Get alerted when a new ticket is assigned to you.</p>
                </div>
              </div>
              <button disabled className="w-12 h-6 bg-gray-200 rounded-full relative opacity-50 cursor-not-allowed">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
