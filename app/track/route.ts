import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Edge runtime to be as fast as possible and read Vercel headers natively
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, portal, user_id } = body;

    if (!session_id || !portal) {
      return NextResponse.json({ error: 'Missing session_id or portal' }, { status: 400 });
    }

    // Extract state/region from Vercel headers.
    // E.g., 'MH' for Maharashtra, 'KA' for Karnataka.
    // If running locally, this will be null.
    const stateRegion = request.headers.get('x-vercel-ip-country-region') || 'Unknown';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Telemetry: Missing Supabase env variables.');
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the visit record. The UNIQUE constraint (session_id, portal, visited_date)
    // combined with ON CONFLICT DO NOTHING ensures we only track 1 row per day per user per portal.
    const { error } = await supabase
      .from('daily_active_users')
      .upsert({
        session_id,
        user_id: user_id || null,
        portal,
        state_region: stateRegion
      }, { onConflict: 'session_id, portal, visited_date', ignoreDuplicates: true });

    if (error) {
      console.error('Telemetry insert error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telemetry route error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
