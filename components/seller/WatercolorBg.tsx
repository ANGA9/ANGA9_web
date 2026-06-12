"use client";
import Image from "next/image";

export default function WatercolorBg() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] mix-blend-multiply">
      <Image
        src="/images/indian_pattern_strong.png"
        alt="Indian Background Pattern"
        fill
        className="object-cover"
        priority
        unoptimized
      />
    </div>
  );
}
