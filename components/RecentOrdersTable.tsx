import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "ORD-7291",
    product: "LED Panel Lights (Box of 50)",
    category: "Electronics",
    categoryColor: "#6C47FF",
    buyer: "Sharma Electricals",
    amount: 48500,
    status: "Delivered",
    date: "Apr 09, 2025",
  },
  {
    id: "ORD-7290",
    product: "Cotton Bed Sheets (Set of 100)",
    category: "Home Decor",
    categoryColor: "#14B8A6",
    buyer: "Gupta Textiles",
    amount: 125000,
    status: "Processing",
    date: "Apr 09, 2025",
  },
  {
    id: "ORD-7289",
    product: "Stainless Steel Bottles (200 pcs)",
    category: "Retail",
    categoryColor: "#F59E0B",
    buyer: "Metro Mart",
    amount: 36000,
    status: "Delivered",
    date: "Apr 08, 2025",
  },
  {
    id: "ORD-7288",
    product: "Office Chairs (25 units)",
    category: "Furniture",
    categoryColor: "#7C3AED",
    buyer: "Prestige Interiors",
    amount: 187500,
    status: "Cancelled",
    date: "Apr 08, 2025",
  },
  {
    id: "ORD-7287",
    product: "Printer Paper A4 (500 reams)",
    category: "Office",
    categoryColor: "#6B7280",
    buyer: "City Office Supplies",
    amount: 62500,
    status: "Processing",
    date: "Apr 07, 2025",
  },
  {
    id: "ORD-7286",
    product: "Industrial Safety Gloves (1000 prs)",
    category: "Industrial",
    categoryColor: "#EF4444",
    buyer: "SafeHands India",
    amount: 95000,
    status: "Delivered",
    date: "Apr 07, 2025",
  },
];

const statusStyles: Record<string, string> = {
  Delivered: "bg-[#22C55E]/10 text-[#22C55E]",
  Processing: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Cancelled: "bg-[#EF4444]/10 text-[#EF4444]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function RecentOrdersTable() {
  return (
    <div className="rounded-xl border border-anga-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-anga-text">Recent Orders</h3>
          <p className="text-sm text-anga-text-secondary">Latest marketplace transactions</p>
        </div>
        <button className="text-sm font-medium text-[#6C47FF] hover:underline">
          View All
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-anga-border hover:bg-transparent">
            <TableHead className="text-xs font-medium text-anga-text-secondary">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-anga-text-secondary">Product</TableHead>
            <TableHead className="text-xs font-medium text-anga-text-secondary">Buyer</TableHead>
            <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Amount</TableHead>
            <TableHead className="text-xs font-medium text-anga-text-secondary">Status</TableHead>
            <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="border-anga-border hover:bg-anga-bg/50 transition-colors cursor-pointer"
            >
              <TableCell className="text-sm font-medium text-anga-text">
                {order.id}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm text-anga-text">{order.product}</p>
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: order.categoryColor }}
                  >
                    {order.category}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-anga-text-secondary">
                {order.buyer}
              </TableCell>
              <TableCell className="text-sm font-medium text-anga-text text-right">
                {formatINR(order.amount)}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    statusStyles[order.status]
                  )}
                >
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="text-sm text-anga-text-secondary text-right">
                {order.date}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
