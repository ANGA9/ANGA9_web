"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

/** Row shape returned by GET /api/categories (product-service category.service.ts) */
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface CategoryChild {
  name: string;
  slug: string;
}

/** A top-level category tab with its children grouped for the mega dropdown */
export interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  children: CategoryChild[];
}

function buildTabs(categories: ApiCategory[]): CategoryTab[] {
  const topLevel = categories.filter((c) => !c.parent_id);
  const tabs = topLevel.map((top) => ({
    id: top.id,
    name: top.name,
    slug: top.slug,
    image_url: top.image_url,
    children: categories
      .filter((c) => c.parent_id === top.id)
      .map((c) => ({ name: c.name, slug: c.slug })),
  }));

  // Frontend-only merge for small categories
  let finalTabs = [...tabs];

  const mergeTargets1 = ["Bath Linen", "Table Linen", "Kitchen Textiles"];
  const toMerge1 = finalTabs.filter(t => mergeTargets1.includes(t.name));
  
  if (toMerge1.length > 1) {
    const primary = toMerge1[0];
    primary.name = "Bath, Table & Kitchen";
    primary.slug = "bath-table-kitchen";
    
    const combinedChildren: CategoryChild[] = [];
    for (const t of toMerge1) {
      combinedChildren.push(...t.children);
    }
    primary.children = combinedChildren;
    
    finalTabs = finalTabs.filter(t => t.id === primary.id || !mergeTargets1.includes(t.name));
  }

  const mergeTargets2 = ["Bedding", "Living & Decor"];
  const toMerge2 = finalTabs.filter(t => mergeTargets2.includes(t.name));
  
  if (toMerge2.length > 1) {
    const primary = toMerge2[0];
    primary.name = "Bedding & Living Decor";
    primary.slug = "bedding-living-decor";
    
    const combinedChildren: CategoryChild[] = [];
    for (const t of toMerge2) {
      combinedChildren.push(...t.children);
    }
    primary.children = combinedChildren;
    
    finalTabs = finalTabs.filter(t => t.id === primary.id || !mergeTargets2.includes(t.name));
  }

  const mergeTargets3 = ["Window Treatments", "Floor Coverings"];
  const toMerge3 = finalTabs.filter(t => mergeTargets3.includes(t.name));
  
  if (toMerge3.length > 1) {
    const primary = toMerge3[0];
    primary.name = "Floors & Windows";
    primary.slug = "floors-windows";
    
    const combinedChildren: CategoryChild[] = [];
    for (const t of toMerge3) {
      combinedChildren.push(...t.children);
    }
    primary.children = combinedChildren;
    
    finalTabs = finalTabs.filter(t => t.id === primary.id || !mergeTargets3.includes(t.name));
  }

  const mergeTargets4 = ["Activewear", "Accessories"];
  const toMerge4 = finalTabs.filter(t => mergeTargets4.includes(t.name));
  
  if (toMerge4.length > 1) {
    const primary = toMerge4[0];
    primary.name = "Active & Extras";
    primary.slug = "active-extras";
    
    const combinedChildren: CategoryChild[] = [];
    for (const t of toMerge4) {
      combinedChildren.push(...t.children);
    }
    primary.children = combinedChildren;
    
    finalTabs = finalTabs.filter(t => t.id === primary.id || !mergeTargets4.includes(t.name));
  }
  
  return finalTabs;
}

// Module-level cache — CategoryStrip mounts in both the shop layout and the
// 404 page; fetch the tree once per session instead of once per mount.
let cached: CategoryTab[] | null = null;
let inflight: Promise<CategoryTab[]> | null = null;

async function fetchTabs(): Promise<CategoryTab[]> {
  if (cached) return cached;
  if (!inflight) {
    inflight = api
      .get<{ categories: ApiCategory[] }>("/api/categories", { silent: true })
      .then((res) => {
        cached = buildTabs(res?.categories ?? []);
        return cached;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Live category tree for navigation, fetched from the real categories table.
 * Returns [] while loading or if the API is unreachable — callers should
 * render nothing rather than a broken strip.
 */
export function useCategories(): { tabs: CategoryTab[]; loading: boolean } {
  const [tabs, setTabs] = useState<CategoryTab[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let alive = true;
    fetchTabs().then((t) => {
      if (alive) {
        setTabs(t);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { tabs, loading };
}
