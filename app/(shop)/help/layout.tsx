"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex md:hidden items-center px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-40">
        <button 
          onClick={() => router.back()} 
          className="mr-3 p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-[17px] font-medium text-gray-900 leading-tight truncate">
          Help and Support
        </h1>
      </header>
      {children}
    </div>
  );
}
