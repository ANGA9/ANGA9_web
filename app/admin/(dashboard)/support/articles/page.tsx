"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, FileText } from "lucide-react";
import { supportApi, supportAdminApi, timeAgo, type Article } from "@/lib/supportApi";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state — simple inline editor
  const [editing, setEditing] = useState<Article | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<"customer" | "seller" | "all">("customer");
  const [category, setCategory] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await supportApi.listArticles({ audience: "all", limit: 100 });
      setArticles(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setSlug("");
    setTitle("");
    setAudience("customer");
    setCategory("");
    setBodyMd("");
    setPublished(true);
    setError(null);
  }

  async function startEdit(a: Article) {
    // Fetch full body
    try {
      const full = await supportApi.getArticle(a.slug);
      setEditing(full);
      setSlug(full.slug);
      setTitle(full.title);
      setAudience(full.audience);
      setCategory(full.category || "");
      setBodyMd(full.body_md || "");
      setPublished(full.published);
    } catch {
      setError("Failed to load article");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim() || !title.trim() || !bodyMd.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await supportAdminApi.upsertArticle({
        slug: slug.trim(),
        title: title.trim(),
        body_md: bodyMd,
        audience,
        category: category.trim() || undefined,
        published,
      });
      startNew();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: string) {
    if (!confirm("Delete this article?")) return;
    await supportAdminApi.deleteArticle(s);
    if (editing?.slug === s) startNew();
    await load();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-bold">Help articles</h1>
      <p className="mt-1 text-sm text-[#4B5563]">
        Knowledge-base entries shown to customers, sellers, or both.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-[320px_1fr]">
        {/* List */}
        <aside className="rounded-xl border border-[#E8EEF4] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8EEF4] px-3 py-2">
            <span className="text-sm font-bold">All articles</span>
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1 rounded-md bg-[#1A6FD4] px-2 py-1 text-xs font-semibold text-white"
            >
              <Plus className="h-3 w-3" /> New
            </button>
          </div>
          {loading ? (
            <div className="p-4 text-sm text-[#9CA3AF]">Loading…</div>
          ) : articles.length === 0 ? (
            <div className="p-4 text-sm text-[#9CA3AF]">No articles yet.</div>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-[#E8EEF4] overflow-y-auto">
              {articles.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => startEdit(a)}
                    className={`flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-[#F8FBFF] ${
                      editing?.id === a.id ? "bg-[#EAF2FF]" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{a.title}</div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {a.audience} · {a.category || "—"} · {a.published ? "Published" : "Draft"} · {timeAgo(a.updated_at)}
                      </div>
                    </div>
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(a.slug); }}
                      className="cursor-pointer rounded p-1 text-[#DC2626] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <form onSubmit={handleSave} className="rounded-xl border border-[#E8EEF4] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-bold mb-3">
            <FileText className="h-4 w-4" />
            {editing ? "Edit article" : "New article"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-article-slug"
                required
                disabled={!!editing}
                className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm font-mono disabled:bg-[#F8FBFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as "customer" | "seller" | "all")}
                className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
              >
                <option value="customer">Customers</option>
                <option value="seller">Sellers</option>
                <option value="all">Everyone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category (optional)</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-semibold mb-1">Body</label>
            <textarea
              rows={14}
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              required
              className="w-full resize-none rounded-md border border-[#E8EEF4] bg-white px-3 py-2 font-mono text-xs"
              placeholder="Plain text or markdown content…"
            />
          </div>

          <label className="mt-3 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[#1A6FD4]"
            />
            Published (visible to users)
          </label>

          {error && (
            <div className="mt-3 rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            {editing && (
              <button
                type="button"
                onClick={startNew}
                className="rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm font-semibold text-[#4B5563]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !slug.trim() || !title.trim() || !bodyMd.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : editing ? "Update article" : "Create article"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
