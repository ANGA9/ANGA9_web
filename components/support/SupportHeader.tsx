"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, Menu, User } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";

import { cdnUrl } from "@/lib/utils";

export default function SupportHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [userName, setUserName] = useState("Agent");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.getSession();
        const res = await api.get<{ user: any }>("/api/users/profile", { silent: true });
        if (active && res?.user) {
          const p = res.user;
          setUserName(p.full_name || `Support ${p.id.slice(0, 4).toUpperCase()}`);
        }
      } catch {
        // Fallback to "Agent" which is the default state
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/support/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 sm:px-6 transition-all">
      <button
        className="lg:hidden mr-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link href="/support/dashboard" className="shrink-0 flex items-center gap-3 group">
        <div className="relative h-7 w-[100px] sm:h-8 sm:w-[120px] transition-transform group-hover:scale-105">
          <Image src={cdnUrl("/anga9-logo.png")} alt="ANGA9" fill priority style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>
      </Link>

      <span className="ml-4 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest hidden md:inline-flex shadow-sm"
        style={{ color: "#0D9488", backgroundColor: "#0D94881A", borderWidth: 1, borderColor: "#0D948833" }}
      >
        Support Portal
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        <div
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-default"
          title={userName}
        >
          <User className="w-4 h-4 font-bold" />
        </div>

        <button
          onClick={handleSignOut}
          title="Logout"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
