"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

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

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-anga-bg">
      <Sidebar />
      <div className="xl:pl-[240px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
