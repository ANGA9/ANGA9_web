import Image from "next/image";

export function EmptyCartIllustration() {
  return (
    <div className="flex justify-center mb-6 mt-4 mix-blend-multiply">
      <Image 
        src="/illustrations/empty_cart.png" 
        alt="Empty Cart" 
        width={350} 
        height={350} 
        className="object-contain opacity-90 hover:scale-105 transition-transform duration-500 ease-out" 
        priority
        unoptimized={true}
      />
    </div>
  );
}
