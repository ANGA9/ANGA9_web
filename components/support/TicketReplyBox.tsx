"use client";

import { useState } from "react";
import { Send, Lock, ChevronDown } from "lucide-react";
import type { Macro } from "@/lib/supportApi";

interface Props {
  onSend: (body: string, opts: { isInternal: boolean }) => Promise<void>;
  allowInternal?: boolean;
  macros?: Macro[];
  disabled?: boolean;
  placeholder?: string;
}

export default function TicketReplyBox({
  onSend,
  allowInternal = false,
  macros = [],
  disabled = false,
  placeholder = "Type your reply…",
}: Props) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [macroOpen, setMacroOpen] = useState(false);

  async function handleSend() {
    if (!body.trim() || sending || disabled) return;
    setSending(true);
    try {
      await onSend(body, { isInternal: internal });
      setBody("");
      setInternal(false);
    } finally {
      setSending(false);
    }
  }

  function applyMacro(m: Macro) {
    setBody((prev) => (prev ? `${prev}\n\n${m.body}` : m.body));
    setMacroOpen(false);
  }

  return (
    <div className="rounded-xl border border-[#E8EEF4] bg-white p-3">
      <textarea
        className="w-full resize-none rounded-md border border-[#E8EEF4] bg-[#F8FBFF] px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:border-[#1A6FD4] focus:bg-white"
        rows={4}
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {allowInternal && (
            <label className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-2 py-1 text-xs font-medium text-[#92400E]">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
                className="h-3 w-3 accent-[#B45309]"
              />
              <Lock className="h-3 w-3" />
              Internal note
            </label>
          )}
          {macros.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMacroOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md border border-[#E8EEF4] bg-white px-2 py-1 text-xs font-medium text-[#4B5563] hover:bg-[#F8FBFF]"
              >
                Insert macro <ChevronDown className="h-3 w-3" />
              </button>
              {macroOpen && (
                <div className="absolute bottom-full mb-1 left-0 z-10 max-h-64 w-64 overflow-y-auto rounded-md border border-[#E8EEF4] bg-white shadow-lg">
                  {macros.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => applyMacro(m)}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-[#F8FBFF]"
                    >
                      <div className="font-semibold text-[#1A1A2E]">{m.title}</div>
                      <div className="line-clamp-2 text-[#4B5563]">{m.body}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!body.trim() || sending || disabled}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#1A6FD4] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : internal ? "Add note" : "Send reply"}
        </button>
      </div>
    </div>
  );
}
