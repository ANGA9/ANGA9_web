"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
}

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

export default function CategoryMultiSelect({ value, onChange, max = 5 }: CategoryMultiSelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<{categories: Category[]}>("/api/categories")
      .then(res => setCategories(res?.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const rootCategories = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const getChildren = (pid: string) => categories.filter(c => c.parent_id === pid).sort((a, b) => a.sort_order - b.sort_order);

  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      if (value.length >= max) return;
      onChange([...value, id]);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const isMax = value.length >= max;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="min-h-[48px] w-full px-3 py-2 bg-white border border-gray-200 rounded-xl cursor-text flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-[#1A6FD4]/20 focus-within:border-[#1A6FD4] transition-all"
        onClick={() => setOpen(true)}
      >
        {value.length === 0 && (
          <span className="text-gray-400 text-[14px] px-1 font-medium">Select up to {max} categories</span>
        )}
        {value.map((id, idx) => (
          <div key={id} className="flex items-center gap-1.5 bg-blue-50 text-[#1A6FD4] border border-blue-200 px-2.5 py-1 rounded-lg text-[14px] font-bold">
            {idx === 0 && <span className="text-[11px] uppercase px-1.5 py-0.5 rounded mr-1 leading-none tracking-wider font-bold bg-[#1A6FD4] text-white">Primary</span>}
            {getCatName(id)}
            <button onClick={(e) => handleRemove(id, e)} className="hover:bg-blue-200/50 p-0.5 rounded-full text-[#1A6FD4]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[14px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{value.length}/{max}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto py-2">
          {isMax && <div className="px-4 py-2 text-[12px] font-bold text-amber-600 bg-amber-50 mx-2 rounded-lg mb-2">Maximum {max} categories selected</div>}
          
          {rootCategories.map(root => {
            const children = getChildren(root.id);
            return (
              <React.Fragment key={root.id}>
                <CategoryOption 
                  category={root} 
                  selected={value.includes(root.id)} 
                  disabled={!value.includes(root.id) && isMax}
                  onToggle={() => handleToggle(root.id)} 
                />
                {children.map(child => (
                  <CategoryOption 
                    key={child.id} 
                    category={child} 
                    selected={value.includes(child.id)} 
                    disabled={!value.includes(child.id) && isMax}
                    onToggle={() => handleToggle(child.id)}
                    level={1}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryOption({ category, selected, disabled, onToggle, level = 0 }: { category: Category, selected: boolean, disabled: boolean, onToggle: () => void, level?: number }) {
  return (
    <div 
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ paddingLeft: `${1 + level * 1.5}rem` }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
    >
      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-[#1A6FD4] border-[#1A6FD4] text-white" : "border-gray-300 bg-white"}`}>
        {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
      </div>
      <span className={`text-[14px] font-medium ${level === 0 ? "text-gray-900 font-bold" : "text-gray-600"}`}>{category.name}</span>
    </div>
  );
}
