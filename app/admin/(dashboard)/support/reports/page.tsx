"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, AlertTriangle, Inbox, CheckCircle2, Star } from "lucide-react";
import { supportAdminApi, type ReportSummary } from "@/lib/supportApi";

export default function AdminSupportReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportAdminApi
      .reportSummary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-8 text-[#1A1A2E]">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-[#1A6FD4]">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="mt-3 flex items-center gap-2 text-2xl md:text-3xl font-bold">
        <BarChart3 className="h-7 w-7 text-[#1A6FD4]" />
        Support reports
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-[#9CA3AF]">Loading…</div>
      ) : !data ? (
        <div className="mt-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-sm text-[#DC2626]">
          Failed to load report.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card
            icon={<Inbox className="h-5 w-5" />}
            label="Open tickets"
            value={data.openTickets}
            tone="blue"
          />
          <Card
            icon={<AlertTriangle className="h-5 w-5" />}
            label="SLA breached"
            value={data.slaBreached}
            tone="red"
          />
          <Card
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Resolved (24h)"
            value={data.resolvedLast24h}
            tone="green"
          />
          <Card
            icon={<Star className="h-5 w-5" />}
            label={`CSAT (n=${data.csat.sampleSize})`}
            value={data.csat.average != null ? `${data.csat.average.toFixed(2)} / 5` : "—"}
            tone="amber"
          />
        </div>
      )}
    </main>
  );
}

function Card({ icon, label, value, tone }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "blue" | "red" | "green" | "amber";
}) {
  const map = {
    blue:  { bg: "#EAF2FF", fg: "#1A6FD4" },
    red:   { bg: "#FEE2E2", fg: "#DC2626" },
    green: { bg: "#DCFCE7", fg: "#16A34A" },
    amber: { bg: "#FEF3C7", fg: "#B45309" },
  } as const;
  const c = map[tone];
  return (
    <div className="rounded-xl border border-[#E8EEF4] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
