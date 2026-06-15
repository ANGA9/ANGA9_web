"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShieldCheck, LogOut, Menu, UserCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SupportHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [userName, setUserName] = useState("Agent");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then((res: any) => {
      if (res.data?.user?.email) {
        setUserName(res.data.user.email.split("@")[0]);
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/support/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full h-[72px] bg-white border-b border-teal-100 z-50 px-4 lg:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/support/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">
            ANGA9 <span className="text-teal-600 font-bold">Support</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100">
          <UserCircle className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-bold text-teal-900">{userName}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-bold transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
