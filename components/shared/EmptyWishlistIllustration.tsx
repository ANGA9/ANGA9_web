import Image from "next/image";

export function EmptyWishlistIllustration() {
  return (
    <div className="flex justify-center mb-2 mt-0 mix-blend-multiply">
      <Image 
        src="/illustrations/empty_wishlist.png" 
        alt="Empty Wishlist" 
        width={380} 
        height={380} 
        className="object-contain opacity-90 " 
        priority
        unoptimized={true}
      />
    </div>
  );
}
