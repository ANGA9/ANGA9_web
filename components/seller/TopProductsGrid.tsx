import { cn } from "@/lib/utils";

const products = [
  {
    name: "Bluetooth Speaker X200",
    category: "Electronics",
    categoryColor: "#1A6FD4",
    unitsSold: 342,
    revenue: 273600,
    stock: "In Stock",
    stockCount: 85,
  },
  {
    name: "USB-C Hub 7-in-1",
    category: "Accessories",
    categoryColor: "#1A6FD4",
    unitsSold: 289,
    revenue: 202300,
    stock: "Low Stock",
    stockCount: 12,
  },
  {
    name: "LED Desk Lamp Pro",
    category: "Lighting",
    categoryColor: "#F59E0B",
    unitsSold: 215,
    revenue: 161250,
    stock: "In Stock",
    stockCount: 64,
  },
  {
    name: "Wireless Earbuds V3",
    category: "Electronics",
    categoryColor: "#1A6FD4",
    unitsSold: 198,
    revenue: 178200,
    stock: "Out of Stock",
    stockCount: 0,
  },
];

const stockStyles: Record<string, string> = {
  "In Stock": "bg-[#22C55E]/10 text-[#22C55E]",
  "Low Stock": "bg-[#F59E0B]/10 text-[#F59E0B]",
  "Out of Stock": "bg-[#EF4444]/10 text-[#EF4444]",
};

function formatINR(value: number) {
  return "\u20B9" + value.toLocaleString("en-IN");
}

export default function TopProductsGrid() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-anga-text">
          Top Performing Products
        </h3>
        <button className="text-sm font-medium text-[#1A6FD4] hover:underline">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="rounded-xl border border-seller-border bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Category badge */}
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white mb-3"
              style={{ backgroundColor: product.categoryColor }}
            >
              {product.category}
            </span>

            <h4 className="text-sm font-semibold text-anga-text mb-3 leading-snug">
              {product.name}
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-anga-text-secondary">Units Sold</span>
                <span className="font-medium text-anga-text">
                  {product.unitsSold}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-anga-text-secondary">Revenue</span>
                <span className="font-medium text-anga-text">
                  {formatINR(product.revenue)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-seller-border">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  stockStyles[product.stock]
                )}
              >
                {product.stock}
                {product.stockCount > 0 && (
                  <span className="ml-1 opacity-70">
                    ({product.stockCount})
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
