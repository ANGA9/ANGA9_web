"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supportAdminApi, timeAgo, type Macro } from "@/lib/supportApi";

export default function AdminMacrosPage() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await supportAdminApi.listMacros();
      setMacros(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await supportAdminApi.createMacro({
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || undefined,
      });
      setTitle("");
      setBody("");
      setCategory("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save macro");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this macro?")) return;
    await supportAdminApi.deleteMacro(id);
    await load();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-bold">Reply macros</h1>
      <p className="mt-1 text-sm text-[#4B5563]">
        Reusable canned replies your team can insert into any ticket.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-5 rounded-xl border border-[#E8EEF4] bg-white p-4"
      >
        <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> New macro
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Macro title (e.g. Refund initiated)"
            required
            className="rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
          />
        </div>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body — supports plain text. Use it like a template."
          required
          className="mt-3 w-full resize-none rounded-md border border-[#E8EEF4] bg-white px-3 py-2 text-sm"
        />
        {error && (
          <div className="mt-2 rounded-md border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">
            {error}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving || !title.trim() || !body.trim()}
            className="rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save macro"}
          </button>
        </div>
      </form>

      <section className="mt-6">
        {loading ? (
          <div className="text-sm text-[#9CA3AF]">Loading macros…</div>
        ) : macros.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8EEF4] bg-white p-8 text-center text-sm text-[#4B5563]">
            No macros yet. Create one above to speed up replies.
          </div>
        ) : (
          <ul className="divide-y divide-[#E8EEF4] rounded-xl border border-[#E8EEF4] bg-white">
            {macros.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{m.title}</span>
                      {m.category && (
                        <span className="rounded-full bg-[#EAF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#1A6FD4]">
                          {m.category}
                        </span>
                      )}
                    </div>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-xs text-[#4B5563]">
                      {m.body}
                    </pre>
                    <div className="mt-1 text-[10px] text-[#9CA3AF]">
                      Updated {timeAgo(m.updated_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded-md border border-[#FECACA] bg-white p-1.5 text-[#DC2626] hover:bg-[#FEE2E2]"
                    aria-label="Delete macro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
