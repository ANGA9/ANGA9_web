import Image from "next/image";

export function EmptyCartIllustration() {
  return (
    <div className="flex justify-center mb-2 mt-0 mix-blend-multiply">
      <Image 
        src="/illustrations/empty_cart.png" 
        alt="Empty Cart" 
        width={380} 
        height={380} 
        className="object-contain opacity-90 " 
        priority
        unoptimized={true}
      />
    </div>
  );
}
