import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import SupportAppLayout from "@/components/support/SupportAppLayout";

/**
 * Auth gate for the support dashboard. Lives under /support/dashboard (NOT the
 * /support root) so that /support/login is never gated — otherwise an
 * unauthenticated visitor would be redirected to /support/login, which would
 * re-trigger the gate and loop forever.
 *
 * Capability check is strict: is_support must be true. Admins/super-admins are
 * granted is_support at login-time reconciliation (team_allowlist), so this
 * single flag is the correct gate for all support actors.
 */
export default async function SupportDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/support/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select("is_support, role, admin_level")
    .eq("auth_uid", session.user.id)
    .single();

  if (!user?.is_support) {
    // Don't sign them out server-side — they may have a valid session on
    // another portal (/admin, /seller) and just strayed into the wrong URL.
    redirect("/unauthorized?reason=not_support");
  }

  return (
    <div className="min-h-screen bg-[#F0FDFA] flex">
      <SupportAppLayout>{children}</SupportAppLayout>
    </div>
  );
}
