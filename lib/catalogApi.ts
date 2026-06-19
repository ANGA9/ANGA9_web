import { api } from "./api";

export interface BulkImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ index: number; error: string }>;
}

export const catalogApi = {
  /**
   * Upload a CSV file of products.
   * Expected columns: name, description, base_price, sale_price, category_ids, min_order_qty, initial_stock
   */
  uploadCsv: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/products/bulk-upload", {
      method: "POST",
      headers: {
        // Automatically picks up multipart boundary
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to upload CSV");
    }

    return res.json();
  },

  /**
   * Import products from JSON array.
   */
  importJson: async (products: any[]): Promise<BulkImportResult> => {
    return api.post<BulkImportResult>("/api/products/bulk-import", { products });
  },
};
