import Image from "next/image";

export function EmptyOrdersIllustration({ type = "orders" }: { type?: "orders" | "help" | "notifications" | "privacy" }) {
  const imgSrc = type === "orders" ? "/illustrations/empty_orders.png" : `/illustrations/empty_${type}.png`;
  
  return (
    <div className="flex justify-center mb-2 mt-0 mix-blend-multiply">
      <Image 
        src={imgSrc} 
        alt={`Empty ${type}`} 
        width={350} 
        height={350} 
        className="object-contain opacity-90 hover:scale-105 transition-transform duration-500 ease-out" 
        priority
        unoptimized={true}
      />
    </div>
  );
}
