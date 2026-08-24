import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  if (!orderId) {
    return new NextResponse("Order ID is required", { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse("Supabase configuration missing", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Lookup order by UUID or order_number
  let orderQuery = supabase
    .from("orders")
    .select("id, customer_id, order_number, invoice_url");

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    orderQuery = orderQuery.eq("id", orderId);
  } else {
    orderQuery = orderQuery.eq("order_number", orderId);
  }

  const { data: order, error } = await orderQuery.single();

  if (error || !order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  let pdfUrl = order.invoice_url;

  // Fallback: Check storage directly
  if (!pdfUrl) {
    const filePath = `${order.customer_id}/${order.id}/invoice.pdf`;
    const { data: publicData } = supabase.storage.from("invoices").getPublicUrl(filePath);
    pdfUrl = publicData?.publicUrl;
  }

  if (!pdfUrl) {
    return new NextResponse("Invoice not generated yet", { status: 404 });
  }

  try {
    const res = await fetch(pdfUrl, { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse("Failed to fetch invoice PDF", { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="invoice.pdf"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || "Internal server error", { status: 500 });
  }
}
