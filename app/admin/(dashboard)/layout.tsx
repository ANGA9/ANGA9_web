"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/admin/login") {
      setAuthed(true);
      return;
    }
    const portal = getCookie("portal");
    if (portal !== "admin") {
      router.replace("/admin/login");
    } else {
      setAuthed(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!authed) return;
    async function fetchStats() {
      try {
        const res = await api.get<{ pendingProducts?: number }>("/api/users/admin-stats", { silent: true });
        setPendingReviewsCount(res?.pendingProducts ?? 0);
      } catch { /* ignore */ }
    }
    fetchStats();
  }, [authed]);

  if (!authed) return null;

  function handleLogout() {
    document.cookie = "portal=; path=/; max-age=0";
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FBFF]" style={{ fontFamily: "var(--font-gilroy)" }}>
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen((v) => !v)} 
        pendingReviewsCount={pendingReviewsCount}
        onLogout={handleLogout}
      />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-[220px] min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}
