"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderTree, Plus, Loader2, Search, Trash2, Edit2, X, ChevronRight, ChevronDown, Upload, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
}

interface CategoriesResp {
  categories: Category[];
}

async function uploadFile(file: File, bucket: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const name = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sb-"))
    ?.split("=")[1];

  if (!token) {
    throw new Error("No auth token for upload");
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const uid = payload.sub;
  const path = `${uid}/${name}`;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
      },
      body: file,
    }
  );
  if (!res.ok) throw new Error(await res.text());
  
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get<CategoriesResp>("/api/categories");
      setCategories(resp?.categories ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category ${category.name}?`)) return;
    try {
      await api.delete(`/api/admin/categories/${category.id}`);
      toast.success("Category deleted");
      setCategories((cs) => cs.filter((c) => c.id !== category.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rootCategories = categories.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const getChildren = (parentId: string) => categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

  const filteredRoots = rootCategories.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    if (c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s)) return true;
    const children = getChildren(c.id);
    return children.some((ch) => ch.name.toLowerCase().includes(s) || ch.slug.toLowerCase().includes(s));
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Categories</h1>
          <p className="text-[15px] text-gray-500 font-medium">Manage product taxonomy and icons</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories"
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-[#8B5CF6] text-white text-[14px] font-bold hover:bg-[#7C3AED] transition-all shadow-sm shadow-[#8B5CF6]/20"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FolderTree className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">No categories yet</h2>
            <p className="text-[15px] font-medium text-gray-500">Click "New Category" to create your taxonomy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Sort</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRoots.map((c) => {
                  const children = getChildren(c.id);
                  const isExpanded = expanded.has(c.id);
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              className="p-1 rounded hover:bg-gray-200 text-gray-400"
                              onClick={() => toggleExpand(c.id)}
                              style={{ visibility: children.length > 0 ? "visible" : "hidden" }}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                              {c.image_url ? (
                                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[13px] font-bold text-gray-500 uppercase">{c.name.substring(0, 2)}</span>
                              )}
                            </div>
                            <span className="font-bold text-gray-900 text-[15px]">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-500 text-[14px]">{c.slug}</td>
                        <td className="px-6 py-3 font-medium text-gray-500 text-[14px] text-right">{c.sort_order}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingCategory(c); setShowModal(true); }}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && children.map((ch) => (
                        <tr key={ch.id} className="hover:bg-gray-50/50 transition-colors group bg-gray-50/30">
                          <td className="px-6 py-3 pl-14">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                                {ch.image_url ? (
                                  <img src={ch.image_url} alt={ch.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[13px] font-bold text-gray-400 uppercase">{ch.name.substring(0, 2)}</span>
                                )}
                              </div>
                              <span className="font-bold text-gray-700 text-[14px]">{ch.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-500 text-[13px]">{ch.slug}</td>
                          <td className="px-6 py-3 font-medium text-gray-500 text-[13px] text-right">{ch.sort_order}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingCategory(ch); setShowModal(true); }}
                                className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-gray-900 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ch)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CategoryModal
          category={editingCategory}
          rootCategories={rootCategories.filter(c => c.id !== editingCategory?.id)}
          onClose={() => setShowModal(false)}
          onSaved={(saved) => {
            if (editingCategory) {
              setCategories(cs => cs.map(c => c.id === saved.id ? saved : c));
            } else {
              setCategories(cs => [...cs, saved]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  rootCategories,
  onClose,
  onSaved
}: {
  category: Category | null;
  rootCategories: Category[];
  onClose: () => void;
  onSaved: (c: Category) => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [parentId, setParentId] = useState(category?.parent_id || "");
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || "0");
  const [imageUrl, setImageUrl] = useState(category?.image_url || "");
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "category-icons");
      setImageUrl(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name,
        slug: slug || undefined,
        parent_id: parentId || null,
        sort_order: parseInt(sortOrder, 10) || 0,
        image_url: imageUrl || null
      };

      let saved: Category;
      if (category) {
        saved = await api.patch<{category: Category}>(`/api/admin/categories/${category.id}`, body).then(r => r?.category as Category);
      } else {
        saved = await api.post<{category: Category}>(`/api/admin/categories`, body).then(r => r?.category as Category);
      }
      toast.success(`Category ${category ? "updated" : "created"}`);
      onSaved(saved);
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-[17px] font-black text-gray-900">{category ? "Edit Category" : "New Category"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics"
              className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
              required
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Slug <span className="text-gray-400 font-medium normal-case">— blank to auto-generate</span></label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder={autoSlug || "e.g., electronics"}
              className="mt-1.5 w-full px-4 py-3 text-[14px] font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Parent Category</label>
            <div className="relative mt-1.5">
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-12 px-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] appearance-none"
              >
                <option value="">None (Top-Level)</option>
                {rootCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 text-[15px] font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2 block">Icon / Image</label>
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste an image URL here"
                  className="w-full px-3 py-2 text-[13px] font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]"
                />
                <div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[12px] font-bold hover:bg-gray-200 transition-colors"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 text-[14px] font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#8B5CF6] text-white text-[14px] font-bold hover:bg-[#7C3AED] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
