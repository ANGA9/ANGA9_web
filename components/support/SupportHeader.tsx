"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut, Menu, User } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { api } from "@/lib/api";

import { cdnUrl } from "@/lib/utils";
import { ChevronDown, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function SupportHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [userName, setUserName] = useState("Agent");
  const [status, setStatus] = useState<"online" | "break" | "offline">("offline");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    let active = true;
    let heartbeatInterval: NodeJS.Timeout;

    const initStatus = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.getSession();
        
        // Load profile
        const resProfile = await api.get<{ user: any }>("/api/users/profile", { silent: true });
        if (active && resProfile?.user) {
          const p = resProfile.user;
          setUserName(p.full_name || `Support ${p.id.slice(0, 4).toUpperCase()}`);
        }

        // Load agent status
        const resAgent = await api.get<{ data: any }>("/api/support/agents/me", { silent: true });
        if (active && resAgent?.data) {
          let currentStatus = resAgent.data.agent_status;
          
          // Auto-online if currently offline
          if (currentStatus === "offline") {
            const resUpdate = await api.patch<{ data: any }>("/api/support/agents/status", { status: "online" }, { silent: true });
            if (resUpdate?.data) {
              currentStatus = resUpdate.data.agent_status;
            }
          }
          setStatus(currentStatus);

          // Start heartbeat
          heartbeatInterval = setInterval(async () => {
            try {
              const res = await api.patch<{ data: any }>("/api/support/agents/heartbeat", {}, { silent: true });
              if (res?.data?.agent_status) {
                setStatus(prev => prev !== res.data.agent_status ? res.data.agent_status : prev);
              }
            } catch (e) {
              console.error("Heartbeat failed", e);
            }
          }, 30000);
        }
      } catch {
        // Silent fail
      }
    };

    initStatus();

    return () => {
      active = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, []);

  const changeStatus = async (newStatus: "online" | "break" | "offline") => {
    try {
      setStatus(newStatus);
      setShowStatusDropdown(false);
      await api.patch("/api/support/agents/status", { status: newStatus }, { silent: true });
    } catch (err) {
      console.error("Failed to change status", err);
    }
  };

  const handleSignOut = async () => {
    // Attempt to set offline before logging out (non-blocking)
    api.patch("/api/support/agents/status", { status: "offline" }, { silent: true }).catch(() => {});
    
    // Clear all portal cookies and localStorage (matching AuthContext.logout cleanup)
    const hostname = window.location.hostname;
    const domainAttr = hostname.endsWith("anga9.com") ? "; domain=.anga9.com" : "";
    const expireAttrs = `; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainAttr}`;
    document.cookie = `portal=${expireAttrs}`;
    document.cookie = `customer_phone=${expireAttrs}`;
    document.cookie = `customer_email=${expireAttrs}`;
    localStorage.removeItem('anga_active_brand_id');

    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut().catch(() => {});
    window.location.href = "/support/login";
  };

  const statusConfig = {
    online: { label: "Online", color: "bg-emerald-500", icon: CheckCircle2, border: "border-emerald-200", bg: "bg-emerald-50" },
    break: { label: "On Break", color: "bg-amber-500", icon: Clock, border: "border-amber-200", bg: "bg-amber-50" },
    offline: { label: "Offline", color: "bg-gray-400", icon: XCircle, border: "border-gray-200", bg: "bg-gray-50" }
  };
  const activeStatus = statusConfig[status];

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
        
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${activeStatus.border} ${activeStatus.bg} transition-all hover:shadow-sm`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${activeStatus.color} shadow-sm`} />
            <span className="text-xs font-bold text-gray-700 hidden sm:block">{activeStatus.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                {(["online", "break", "offline"] as const).map(s => {
                  const conf = statusConfig[s];
                  const Icon = conf.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${conf.color}`} />
                      <span className={`text-sm font-bold ${status === s ? "text-gray-900" : "text-gray-600"}`}>
                        {conf.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

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
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
