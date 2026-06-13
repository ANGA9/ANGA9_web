"use client";

import { cdnUrl } from "@/lib/utils";

export default function WatercolorBg() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] mix-blend-multiply">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cdnUrl("/images/indian_pattern_strong.png")}
        alt=""
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
}
