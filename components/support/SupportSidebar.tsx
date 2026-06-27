"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Inbox,
  User,
  Trophy,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/support/dashboard", icon: LayoutDashboard },
  { label: "Ticket Queue", href: "/support/dashboard/tickets", icon: Inbox },
  { label: "My Tickets", href: "/support/dashboard/tickets?filter=mine", icon: User },
  { label: "Leaderboard", href: "/support/dashboard/leaderboard", icon: Trophy },
  { label: "Settings", href: "/support/dashboard/settings", icon: Settings },
];

export default function SupportSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [agentName, setAgentName] = useState<string>("Support Agent");
  const [agentRole, setAgentRole] = useState<string>("Active");

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setAgentName(profile.full_name || "Support Agent");
          setAgentRole(profile.role === 'admin' ? 'Executive' : 'Support Agent');
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/support/dashboard") return pathname === "/support/dashboard";
    // For query params like ?filter=mine we'd need to check useSearchParams in a real app,
    // but for now we'll do simple path prefix matching
    const basePath = href.split('?')[0];
    if (href.includes('?filter=')) return false; // Handled separately if we added useSearchParams
    return pathname.startsWith(basePath);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={onClose} />
      )}
      
      <aside
        className={`fixed top-[72px] left-0 z-50 h-[calc(100vh-72px)] w-[260px] bg-white border-r border-teal-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 hover:text-teal-900 hover:bg-teal-100 transition-colors" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-1.5">
          <div className="text-[11px] font-black text-teal-600/60 uppercase tracking-widest mb-3 px-3">Agent Workspace</div>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-gray-600 hover:bg-teal-50 hover:text-teal-900"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? "text-white" : "text-gray-400 group-hover:text-teal-600"}`} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-teal-100 bg-teal-50/50 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm text-white font-black text-sm">
              {agentName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900">{agentName}</span>
              <span className="text-[11px] font-medium text-teal-600">{agentRole}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
