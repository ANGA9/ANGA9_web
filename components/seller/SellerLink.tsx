"use client";

import Link, { type LinkProps } from "next/link";
import { sellerHref, useSellerSubdomain } from "@/lib/sellerHref";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = Omit<LinkProps, "href"> &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps | "href"> & {
    href: string;
    children?: ReactNode;
  };

export default function SellerLink({ href, children, ...rest }: Props) {
  const onSub = useSellerSubdomain();
  return (
    <Link href={sellerHref(href, onSub)} {...rest}>
      {children}
    </Link>
  );
}
