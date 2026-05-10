"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { supportApi, type Article } from "@/lib/supportApi";

export default function SellerArticlePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState<null | "yes" | "no">(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supportApi.getArticle(slug)
      .then((a) => { if (active) setArticle(a); })
      .catch(() => { if (active) setArticle(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  async function handleFeedback(helpful: boolean) {
    if (feedbackSent) return;
    setFeedbackSent(helpful ? "yes" : "no");
    try {
      await supportApi.feedbackArticle(slug, helpful);
    } catch {
      setFeedbackSent(null);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-6">Loading…</main>;
  }
  if (!article) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <button onClick={() => router.back()} className="text-sm text-[#1A6FD4]">← Back</button>
        <div className="mt-4 rounded-xl border border-[#E8EEF4] bg-white p-6 text-center text-sm text-[#4B5563]">
          Article not found.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <Link href="/seller/dashboard/help" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to seller support
      </Link>

      <h1 className="mt-3 text-2xl md:text-3xl font-bold text-[#1A1A2E]">{article.title}</h1>
      {article.category && (
        <div className="mt-1 text-xs text-[#9CA3AF]">{article.category}</div>
      )}

      <article className="mt-6 whitespace-pre-wrap rounded-xl border border-[#E8EEF4] bg-white p-5 text-sm md:text-base leading-relaxed text-[#1A1A2E]">
        {article.body_md}
      </article>

      <section className="mt-6 rounded-xl border border-[#E8EEF4] bg-white p-4">
        <div className="text-sm font-semibold mb-2">Was this helpful?</div>
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback(true)}
            disabled={!!feedbackSent}
            className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm ${
              feedbackSent === "yes" ? "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]" : "border-[#E8EEF4] hover:bg-[#F8FBFF]"
            }`}
          >
            <ThumbsUp className="h-4 w-4" /> Yes
          </button>
          <button
            onClick={() => handleFeedback(false)}
            disabled={!!feedbackSent}
            className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm ${
              feedbackSent === "no" ? "border-[#DC2626] bg-[#FEE2E2] text-[#DC2626]" : "border-[#E8EEF4] hover:bg-[#F8FBFF]"
            }`}
          >
            <ThumbsDown className="h-4 w-4" /> No
          </button>
        </div>
        {feedbackSent === "no" && (
          <div className="mt-3 text-sm text-[#4B5563]">
            Sorry this didn&apos;t help.{" "}
            <Link href="/seller/dashboard/help/tickets/new" className="font-semibold text-[#1A6FD4] underline">
              Raise a ticket
            </Link>{" "}
            and we&apos;ll get back to you.
          </div>
        )}
      </section>
    </main>
  );
}
