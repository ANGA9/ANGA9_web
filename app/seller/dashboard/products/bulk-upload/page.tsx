"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { bulkApi, type BulkImportResult } from "@/lib/bulkApi";
import toast from "react-hot-toast";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "text/csv") {
      setFile(selected);
      setResult(null);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "text/csv") {
      setFile(dropped);
      setResult(null);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await bulkApi.uploadCsv(file);
      setResult(res);
      toast.success(`Successfully imported ${res.imported} products`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  };

  const generateTemplate = () => {
    const headers = ["name", "description", "base_price", "sale_price", "category_ids", "min_order_qty", "initial_stock"];
    const row = ["Sample Product", "Description goes here", "1000", "800", "uuid-of-category", "10", "100"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + row.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anga9_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="w-full mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/dashboard/products" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </Link>
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Bulk Upload Products</h1>
          <p className="text-[15px] text-gray-500 font-medium">Upload a CSV file to add multiple products at once</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Upload Area */}
        <div className="md:col-span-2 space-y-6">
          <div
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              file ? "border-[#1A6FD4] bg-blue-50/50" : "border-gray-300 hover:border-[#1A6FD4] bg-white"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-[#1A6FD4]" />
            </div>

            {file ? (
              <div>
                <p className="text-[16px] font-bold text-gray-900 mb-1">{file.name}</p>
                <p className="text-[13px] text-gray-500 font-medium mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setFile(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-md disabled:opacity-50 bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload & Process
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[16px] font-bold text-gray-900 mb-2">Drag and drop your CSV file here</p>
                <p className="text-[14px] text-gray-500 mb-6">or click to browse from your computer</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-md bg-[#1A6FD4] text-white hover:bg-[#1559B3]"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Results Area */}
          {result && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-[18px] font-bold text-gray-900 mb-4">Upload Results</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    Success
                  </div>
                  <p className="text-3xl font-black text-green-800">{result.imported}</p>
                  <p className="text-[13px] text-green-600 font-medium">Rows imported</p>
                </div>
                <div className={`${result.errors.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border rounded-2xl p-4`}>
                  <div className={`flex items-center gap-2 font-bold mb-1 ${result.errors.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    {result.errors.length > 0 ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    Errors
                  </div>
                  <p className={`text-3xl font-black ${result.errors.length > 0 ? 'text-red-800' : 'text-gray-800'}`}>{result.errors.length}</p>
                  <p className={`text-[13px] font-medium ${result.errors.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>Rows failed</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Error Details</h3>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-red-100 bg-red-50/50 p-2 space-y-2">
                    {result.errors.map((err, i) => (
                      <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-red-100 text-[13px]">
                        <span className="font-bold text-red-700 min-w-[50px]">Row {err.row}</span>
                        <span className="text-gray-700 font-medium">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Instructions & Template */}
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 h-fit">
          <h2 className="text-[16px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Instructions
          </h2>
          <ul className="space-y-3 text-[13px] text-gray-600 font-medium mb-6">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              Download the template to ensure your columns match exactly.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              Maximum 500 rows per upload.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              Category IDs must be valid UUIDs from the category list. Multiple IDs can be separated by commas inside quotes.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              Empty or invalid rows will be skipped, and successful rows will still be imported.
            </li>
          </ul>

          <button
            onClick={generateTemplate}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>
      </div>
    </main>
  );
}
