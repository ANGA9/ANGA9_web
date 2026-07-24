"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Send, Image as ImageIcon, Smartphone, Loader2, CheckCircle2 } from "lucide-react";

export default function MarketingPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<{ successCount: number; failureCount: number } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setResult(null);

    try {
      const res = await api.post<{ successCount: number; failureCount: number }>("/api/notifications/promo", {
        title,
        body,
        imageUrl,
      });
      setResult(res);
      setSuccess(true);
      setTitle("");
      setBody("");
      setImageUrl("");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Marketing & Promos</h1>
        <p className="text-[15px] text-gray-500 font-medium">Broadcast rich push notifications to all users instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 FLAT 50% OFF - Weekend Sale!"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Don't miss out on the biggest fashion sale of the season. Tap to shop now!"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Banner Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/promo-banner.jpg"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all"
                />
              </div>
              <p className="mt-1.5 text-[12px] text-gray-500 font-medium">Leave blank for a text-only notification.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold">
                {error}
              </div>
            )}

            {success && result && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 text-[14px] font-bold">Broadcast Sent Successfully!</p>
                  <p className="text-green-700 text-[13px] font-medium mt-1">
                    Successfully delivered to {result.successCount} devices. ({result.failureCount} failed).
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !title}
              className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-3 rounded-xl text-[14px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#8B5CF6]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Broadcast to All Users
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Preview ── */}
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-[#8B5CF6]" /> Android App Preview
          </h2>
          
          <div className="w-[300px] h-[600px] bg-gray-900 rounded-[2.5rem] p-3 shadow-xl mx-auto border-[6px] border-gray-800 relative flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
              <div className="w-32 h-4 bg-gray-800 rounded-b-xl" />
            </div>

            {/* Screen */}
            <div className="bg-gray-100 flex-1 rounded-[2rem] overflow-hidden relative font-sans">
              
              {/* Fake App Content */}
              <div className="h-full w-full bg-white flex flex-col items-center justify-center text-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-4" />
                <div className="w-32 h-4 bg-gray-100 rounded-full mb-2" />
                <div className="w-24 h-4 bg-gray-100 rounded-full" />
              </div>

              {/* Notification Popup (Only show if there's text) */}
              {(title || body || imageUrl) && (
                <div className="absolute top-4 inset-x-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 z-10">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#8B5CF6] rounded flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">A9</span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 flex-1">ANGA9 • now</span>
                    </div>
                    {imageUrl && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                        <img src={imageUrl} alt="Promo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                    <h3 className="text-[14px] font-bold text-gray-900 leading-tight mb-1">{title || "Notification Title"}</h3>
                    {body && <p className="text-[13px] font-medium text-gray-600 leading-tight">{body}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
