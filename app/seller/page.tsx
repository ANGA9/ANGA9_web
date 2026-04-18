import { redirect } from "next/navigation";

export default function SellerPageRedirect() {
  redirect("/seller/sell-online");
}