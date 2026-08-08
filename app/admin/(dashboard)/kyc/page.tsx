"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  UserCheck
} from "lucide-react";
import toast from "react-hot-toast";

interface KycRecord {
  id: string;
  user_id: string;
  business_name: string;
  gstin: string;
  pan_number: string;
  verification_status: string;
  submitted_at: string;
  users: {
    email?: string;
    phone?: string;
  };
}

export default function PendingKycPage() {
  const [kycList, setKycList] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get<KycRecord[]>("/api/users/admin/kyc/pending", { silent: true });
      setKycList(res || []);
    } catch {
      toast.error("Failed to load pending KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const pendingCount = kycList.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-medium text-gray-900 tracking-tight">Pending KYC Approvals</h1>
          <p className="text-[15px] text-gray-500 font-medium">
            {pendingCount} customer{pendingCount !== 1 ? "s" : ""} waiting for B2B verification
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        </div>
      ) : pendingCount === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">All caught up</h2>
          <p className="text-[15px] text-gray-500 font-medium">
            No customers are waiting for KYC review right now.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kycList.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px] text-gray-900">
                            {k.business_name}
                          </span>
                          <span className="text-[12px] text-gray-500">GST: {k.gstin}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-gray-900">
                          {k.users?.phone || "—"}
                        </span>
                        <span className="text-[12px] text-gray-500">
                          {k.users?.email || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-gray-500">
                      {new Date(k.submitted_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/admin/kyc/${k.user_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all shadow-sm bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" /> Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
