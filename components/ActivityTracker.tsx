'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export function ActivityTracker() {
  const pathname = usePathname();
  // Per-portal in-flight guard. A single boolean ref would suppress tracking of
  // every portal after the first one in an SPA session (e.g. customer → seller
  // client-nav would never log 'seller'), defeating the portal breakdown. We
  // key by portal so each portal is still pinged once, and use it only to guard
  // against React Strict Mode's double-invoke and concurrent in-flight calls.
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function trackActivity() {
      const today = new Date().toISOString().split('T')[0];
      let portal = 'customer';
      if (pathname.startsWith('/seller')) portal = 'seller';
      else if (pathname.startsWith('/support')) portal = 'support';
      else if (pathname.startsWith('/admin')) portal = 'admin';

      if (inFlight.current.has(portal)) return;

      // Check localStorage to avoid pinging /track repeatedly on the same day
      const storageKey = `anga9_tracked_${portal}_${today}`;
      if (localStorage.getItem(storageKey) === 'true') return;

      inFlight.current.add(portal);

      // Generate or retrieve anonymous session_id
      let sessionId = localStorage.getItem('anga9_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('anga9_session_id', sessionId);
      }

      // Try to get logged-in user_id if available
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Call tracking endpoint
      try {
        const res = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, portal, user_id: userId })
        });

        if (res.ok) {
          // Persist the daily guard so reloads don't re-ping for this portal.
          localStorage.setItem(storageKey, 'true');
        } else {
          // Transient server error — release so a later navigation can retry.
          inFlight.current.delete(portal);
        }
      } catch (e) {
        console.error("Failed to track activity:", e);
        inFlight.current.delete(portal);
      }
    }

    trackActivity();
  }, [pathname]);

  return null; // Silent component
}
