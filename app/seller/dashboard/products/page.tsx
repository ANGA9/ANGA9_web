import { Plus, Search, Filter } from "lucide-react";
import SellerHeader from "@/components/seller/SellerHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const products = [
  { name: "Bluetooth Speaker X200", sku: "SKU-1001", category: "Electronics", price: 8400, stock: 85, status: "Active" },
  { name: "USB-C Hub 7-in-1", sku: "SKU-1002", category: "Accessories", price: 4200, stock: 12, status: "Active" },
  { name: "LED Desk Lamp Pro", sku: "SKU-1003", category: "Lighting", price: 3750, stock: 64, status: "Active" },
  { name: "Wireless Earbuds V3", sku: "SKU-1004", category: "Electronics", price: 5400, stock: 0, status: "Out of Stock" },
  { name: "HDMI Cable 2m (Pack of 10)", sku: "SKU-1005", category: "Accessories", price: 1200, stock: 230, status: "Active" },
  { name: "Smart Power Strip", sku: "SKU-1006", category: "Electronics", price: 2800, stock: 45, status: "Active" },
  { name: "Webcam HD 1080p", sku: "SKU-1007", category: "Electronics", price: 3200, stock: 0, status: "Pending Approval" },
];

const statusStyles: Record<string, string> = {
  Active: "bg-[#22C55E]/10 text-[#22C55E]",
  "Out of Stock": "bg-[#EF4444]/10 text-[#EF4444]",
  "Pending Approval": "bg-[#F59E0B]/10 text-[#F59E0B]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function SellerProductsPage() {
  return (
    <div className="min-h-screen">
      <SellerHeader />
      <main className="p-6 xl:p-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-anga-text">My Products</h1>
            <p className="text-sm text-anga-text-secondary">
              Manage your product listings
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#6C47FF] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#5835DB] transition-colors">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Filters bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-anga-text-secondary" />
            <input
              type="text"
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-seller-border bg-white pl-10 pr-4 text-sm text-anga-text placeholder:text-anga-text-secondary/60 focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 transition-colors"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-seller-border bg-white px-4 py-2.5 text-sm font-medium text-anga-text-secondary hover:bg-seller-bg transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Product table */}
        <div className="rounded-xl border border-seller-border bg-white p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-seller-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-anga-text-secondary">Product</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">SKU</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Category</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Price</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Stock</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary">Status</TableHead>
                <TableHead className="text-xs font-medium text-anga-text-secondary text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.sku} className="border-seller-border hover:bg-seller-bg/50 transition-colors">
                  <TableCell className="text-sm font-medium text-anga-text">{product.name}</TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">{product.sku}</TableCell>
                  <TableCell className="text-sm text-anga-text-secondary">{product.category}</TableCell>
                  <TableCell className="text-sm font-medium text-anga-text text-right">{formatINR(product.price)}</TableCell>
                  <TableCell className="text-sm text-anga-text text-right">{product.stock}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", statusStyles[product.status])}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs font-medium text-[#6C47FF] hover:underline">Edit</button>
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
