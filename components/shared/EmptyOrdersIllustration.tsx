import Image from "next/image";

export function EmptyOrdersIllustration() {
  return (
    <div className="flex justify-center mb-6 mt-4 mix-blend-multiply">
      <Image 
        src="/illustrations/empty_orders.png" 
        alt="Empty Orders" 
        width={240} 
        height={240} 
        className="object-contain opacity-90 hover:scale-105 transition-transform duration-500 ease-out" 
        priority
        unoptimized={true}
      />
    </div>
  );
}
