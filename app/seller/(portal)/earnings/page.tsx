import { IndianRupee, ArrowUpRight, ArrowDownRight, Landmark } from "lucide-react";
import SellerHeader from "@/components/seller/SellerHeader";
import EarningsChart from "@/components/seller/EarningsChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const payoutHistory = [
  { id: "PAY-301", date: "Mar 15, 2025", amount: 118000, method: "HDFC ****4821", status: "Completed" },
  { id: "PAY-289", date: "Feb 15, 2025", amount: 105400, method: "HDFC ****4821", status: "Completed" },
  { id: "PAY-274", date: "Jan 15, 2025", amount: 92800, method: "HDFC ****4821", status: "Completed" },
  { id: "PAY-260", date: "Dec 15, 2024", amount: 110500, method: "HDFC ****4821", status: "Completed" },
  { id: "PAY-245", date: "Nov 15, 2024", amount: 87600, method: "HDFC ****4821", status: "Completed" },
];

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function SellerEarningsPage() {
  return (
    <div className="min-h-screen">
      <SellerHeader />
      <main className="p-6 xl:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-anga-text">Earnings</h1>
          <p className="text-sm text-anga-text-secondary">
            Track your revenue and payouts
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C47FF]/10">
                <IndianRupee className="h-5 w-5 text-[#6C47FF]" />
              </div>
              <span className="text-sm font-medium text-anga-text-secondary">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-anga-text">{"\u20B9"}8,34,200</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
              <ArrowUpRight className="h-3 w-3" />
              12.4% vs last month
            </div>
          </div>
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]/10">
                <Landmark className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <span className="text-sm font-medium text-anga-text-secondary">Pending Payout</span>
            </div>
            <p className="text-2xl font-bold text-anga-text">{"\u20B9"}1,24,500</p>
            <p className="mt-2 text-xs text-anga-text-secondary">Scheduled: 15th April</p>
          </div>
          <div className="rounded-xl border border-seller-border bg-white p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EF4444]/10">
                <ArrowDownRight className="h-5 w-5 text-[#EF4444]" />
              </div>
              <span className="text-sm font-medium text-anga-text-secondary">Platform Fee</span>
            </div>
            <p className="text-2xl font-bold text-anga-text">{"\u20B9"}41,710</p>
            <p className="mt-2 text-xs text-anga-text-secondary">5% commission this month</p>
          </div>
        </div>

        {/* Earnings chart */}
        <div className="mb-6">
          <EarningsChart />
        </div>

        {/* Payout history */}
        <div className="rounded-xl border border-seller-border bg-white p-6">
          <h3 className="text-base font-semibold text-anga-text mb-4">
            Payout History
          </h3>
          <Table>
            <TableHeader>
              <TableRow className="border-seller-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-anga-text-secondary">Payout ID</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Date</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Method</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((payout) => (
                <TableRow key={payout.id} className="border-seller-border hover:bg-seller-bg/50 transition-colors">
                  <TableCell className="text-sm font-medium text-anga-text">{payout.id}</TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">{payout.date}</TableCell>
                  <TableCell className="text-sm font-medium text-anga-text text-right">{formatINR(payout.amount)}</TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">{payout.method}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22C55E]">
                      {payout.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
