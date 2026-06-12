"use client";
import Image from "next/image";

export default function WatercolorBg() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-100 mix-blend-multiply">
      <Image
        src="/images/watercolor_bg.png"
        alt="Watercolor Background"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
