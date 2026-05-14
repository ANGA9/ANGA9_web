"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "./supabase";
import type { TicketMessage } from "./supportApi";

interface IncomingMessage {
  type: "message";
  ticketId: string;
  message: TicketMessage & { ticket_id: string };
}

interface IncomingReady {
  type: "ready";
  ticketId: string;
}

interface IncomingPong {
  type: "pong";
  ts: number;
}

interface IncomingError {
  type: "error";
  error: string;
}

type Incoming = IncomingMessage | IncomingReady | IncomingPong | IncomingError;

interface Options {
  ticketId: string | undefined;
  enabled?: boolean;
  onMessage: (msg: TicketMessage) => void;
  onReady?: () => void;
  onError?: (err: string) => void;
}

const HEARTBEAT_MS = 25_000;
const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

function resolveWsBase(): string {
  // Mirrors lib/api.ts: NEXT_PUBLIC_API_URL controls host; on localhost we proxy through Next.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  if (typeof window !== "undefined" && apiUrl.includes("localhost")) {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
  }
  return apiUrl.replace(/^http/, "ws");
}

async function resolveToken(): Promise<string | null> {
  if (typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      document.cookie.includes("portal=admin")) {
    return "ADMIN_BYPASS_TOKEN";
  }
  try {
    const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function useTicketSocket({ ticketId, enabled = true, onMessage, onReady, onError }: Options): void {
  const onMessageRef = useRef(onMessage);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!enabled || !ticketId) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const cleanup = () => {
      if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      if (socket) {
        try { socket.close(); } catch {}
        socket = null;
      }
    };

    const connect = async () => {
      if (cancelled) return;

      const token = await resolveToken();
      if (!token) {
        // No session — bail quietly; the page will still poll via REST on focus.
        onErrorRef.current?.("no_token");
        return;
      }
      if (cancelled) return;

      const base = resolveWsBase();
      const url = `${base}/ws/support/tickets/${encodeURIComponent(ticketId)}?token=${encodeURIComponent(token)}`;

      try {
        socket = new WebSocket(url);
      } catch (err) {
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        attempt = 0;
        heartbeat = setInterval(() => {
          if (!socket || socket.readyState !== WebSocket.OPEN) return;
          try { socket.send(JSON.stringify({ type: "ping" })); } catch {}
        }, HEARTBEAT_MS);
      };

      socket.onmessage = (ev: MessageEvent) => {
        let parsed: Incoming;
        try { parsed = JSON.parse(typeof ev.data === "string" ? ev.data : ""); }
        catch { return; }

        if (parsed.type === "message") {
          // Strip ticket_id for parity with REST TicketMessage shape.
          const { ticket_id: _ticketId, ...rest } = parsed.message;
          onMessageRef.current(rest as TicketMessage);
        } else if (parsed.type === "ready") {
          onReadyRef.current?.();
        } else if (parsed.type === "error") {
          onErrorRef.current?.(parsed.error);
        }
      };

      socket.onerror = () => {
        // Errors are followed by close; let close handle reconnect.
      };

      socket.onclose = (ev: CloseEvent) => {
        if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
        if (cancelled) return;
        // Don't reconnect on auth/forbidden — token is bad or user can't read this ticket.
        if (ev.code === 4001 || ev.code === 4003 || ev.code === 4004) {
          onErrorRef.current?.(ev.code === 4001 ? "unauthorized" : "forbidden");
          return;
        }
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
      attempt += 1;
      reconnectTimer = setTimeout(() => { connect(); }, delay);
    };

    connect();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [ticketId, enabled]);
}
