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
  name: string;
  slug: string;
  children: CategoryChild[];
}

function buildTabs(categories: ApiCategory[]): CategoryTab[] {
  const topLevel = categories.filter((c) => !c.parent_id);
  return topLevel.map((top) => ({
    name: top.name,
    slug: top.slug,
    children: categories
      .filter((c) => c.parent_id === top.id)
      .map((c) => ({ name: c.name, slug: c.slug })),
  }));
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
