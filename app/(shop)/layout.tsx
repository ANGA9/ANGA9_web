import CustomerTopNav from "@/components/customer/CustomerTopNav";
import CategoryStrip from "@/components/customer/CategoryStrip";
import MobileTopHeader from "@/components/customer/MobileTopHeader";
import MobileBottomNav from "@/components/customer/MobileBottomNav";
import LoginSheet from "@/components/customer/LoginSheet";
import { LoginSheetProvider } from "@/lib/LoginSheetContext";
import { CUSTOMER_THEME as t } from "@/lib/customerTheme";

export default function CustomerShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoginSheetProvider>
      <div className="min-h-screen" style={{ background: t.bgPage }}>

        {/* ══════════ DESKTOP NAV (md+) ══════════ */}
        <div className="hidden md:block">
          <CustomerTopNav />
          <CategoryStrip />
        </div>

        {/* ══════════ MOBILE NAV (<md) ══════════ */}
        <div className="block md:hidden sticky top-0 z-40">
          <MobileTopHeader />
        </div>

        {/* ══════════ PAGE CONTENT ══════════ */}
        <main
          className="mx-auto pb-20 md:pb-0"
          style={{ maxWidth: 1280, padding: "0 24px" }}
        >
          {children}
        </main>

        {/* ══════════ MOBILE BOTTOM NAV (<md) ══════════ */}
        <MobileBottomNav />

        {/* ══════════ MOBILE LOGIN SHEET ══════════ */}
        <LoginSheet />
      </div>
    </LoginSheetProvider>
  );
}
