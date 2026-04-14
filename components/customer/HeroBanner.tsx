"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Speaker, 
  Wind, 
  Smartphone, 
  Briefcase, 
  Shirt, 
  Gamepad2, 
  ChefHat, 
  Laptop 
} from "lucide-react";

const BANNERS = [
  {
    id: 1,
    gradientClass: "from-orange-500 to-orange-400",
    badge: "MIVI",
    headline: "Hear Every Note",
    subtext: "Experience true clarity",
    priceText: "From ₹1,519",
    icon: Speaker,
    isAd: false,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 2,
    gradientClass: "from-yellow-400 to-yellow-300",
    badge: "Realme TechLife",
    headline: "5-in-1 Convertible AC",
    subtext: "Stay cool with smart wifi",
    priceText: "From ₹26,990",
    icon: Wind,
    isAd: true,
    textClass: "text-zinc-900",
    badgeClass: "bg-black/10 text-zinc-900",
  },
  {
    id: 3,
    gradientClass: "from-red-700 to-red-600",
    badge: "Flipkart Special",
    headline: "Nova 2 5G Sale is Live",
    subtext: "",
    priceText: "From ₹8,999",
    icon: Smartphone,
    isAd: false,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 4,
    gradientClass: "from-blue-600 to-blue-500",
    badge: "B2B Exclusive",
    headline: "Bulk Discounts on Office Essentials",
    subtext: "Up to 40% off for verified businesses",
    priceText: "Shop Now",
    icon: Briefcase,
    isAd: true,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 5,
    gradientClass: "from-emerald-500 to-emerald-400",
    badge: "Trending Now",
    headline: "Fresh Arrivals in Fashion",
    subtext: "Grab before it sells out",
    priceText: "Starting ₹499",
    icon: Shirt,
    isAd: false,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 6,
    gradientClass: "from-purple-600 to-purple-500",
    badge: "GameZone",
    headline: "Gaming Gear Sale",
    subtext: "Level up your setup",
    priceText: "Upto 60% Off",
    icon: Gamepad2,
    isAd: false,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 7,
    gradientClass: "from-sky-500 to-sky-400",
    badge: "HomeChef",
    headline: "Kitchen Essentials",
    subtext: "Upgrade your cooking space",
    priceText: "From ₹299",
    icon: ChefHat,
    isAd: true,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 8,
    gradientClass: "from-zinc-900 to-zinc-800",
    badge: "TechDeals",
    headline: "Premium Laptops",
    subtext: "Work smarter, not harder",
    priceText: "Starting ₹45,999",
    icon: Laptop,
    isAd: false,
    textClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  }
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const length = BANNERS.length;

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % length);
  const prevBanner = () => setCurrentIndex((prev) => (prev - 1 + length) % length);

  useEffect(() => {
    const interval = setInterval(nextBanner, 5000);
    return () => clearInterval(interval);
  }, []);

  function getPositionClasses(index: number) {
    const diff = (index - currentIndex + length) % length;
    
    if (diff === 0) {
      // CENTER ACTIVE
      return "z-10 opacity-100 scale-100 translate-x-0";
    } else if (diff === 1) {
      // NEXT
      return "z-0 opacity-0 sm:opacity-50 scale-95 translate-x-[105%] sm:translate-x-[85%] md:translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else if (diff === length - 1) {
      // PREV
      return "z-0 opacity-0 sm:opacity-50 scale-95 -translate-x-[105%] sm:-translate-x-[85%] md:-translate-x-[90%] cursor-pointer pointer-events-auto sm:hover:opacity-75";
    } else {
      // HIDDEN / FAR AWAY
      if (diff > 1 && diff <= Math.floor(length / 2)) {
        return "-z-10 opacity-0 scale-90 translate-x-[200%] pointer-events-none";
      }
      return "-z-10 opacity-0 scale-90 -translate-x-[200%] pointer-events-none";
    }
  }

  return (
    <div className="w-full pb-6 pt-2">
      <div className="relative w-full h-[180px] sm:h-[260px] md:h-[280px] flex items-center justify-center overflow-hidden">
        {BANNERS.map((b, i) => {
          const Icon = b.icon;
          return (
            <div 
              key={b.id} 
              className={`absolute w-full sm:w-[75%] md:w-[70%] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${getPositionClasses(i)}`}
              onClick={() => {
                 const diff = (i - currentIndex + length) % length;
                 if (diff === 1) nextBanner();
                 if (diff === length - 1) prevBanner();
              }}
            >
              <div className={`w-full h-full rounded-2xl flex p-6 sm:p-8 bg-gradient-to-br shadow-md ${b.gradientClass}`}>
               {/* Left Content */}
               <div className="flex-1 flex flex-col justify-center relative z-10">
                  <span className={`inline-flex items-center w-max px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full mb-3 sm:mb-4 ${b.badgeClass}`}>
                    {b.badge}
                  </span>
                  <div className="mb-auto">
                    <h2 className={`text-[19px] sm:text-2xl md:text-3xl font-extrabold leading-tight ${b.textClass}`}>
                       {b.headline}
                    </h2>
                    {b.subtext && (
                      <p className={`mt-1.5 text-xs sm:text-sm md:text-base opacity-90 font-medium ${b.textClass}`}>
                         {b.subtext}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-5">
                      <span className={`inline-block font-bold text-xs sm:text-sm md:text-base px-3 py-1.5 rounded-lg bg-black/10 backdrop-blur-sm ${b.textClass}`}>
                          {b.priceText}
                      </span>
                  </div>
               </div>
               
               {/* Right Side Placholder Image / Graphic */}
               <div className="w-1/3 sm:w-1/2 flex flex-col items-end justify-center relative">
                  <div className={`w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-[20px] backdrop-blur-sm flex items-center justify-center shadow-lg rotate-[5deg] transition-transform hover:rotate-0 ${b.textClass === 'text-white' ? 'bg-white/10' : 'bg-black/5'}`}>
                       <Icon className={`w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-80 ${b.textClass}`} strokeWidth={1.5} />
                  </div>
                  {b.isAd && (
                    <div className={`absolute bottom-2 right-2 backdrop-blur border text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-80 ${b.textClass === 'text-white' ? 'bg-black/30 border-white/20 text-white' : 'bg-black/10 border-black/10 text-black'}`}>
                      AD
                    </div>
                  )}
               </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (Desktop) */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevBanner(); }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all hidden sm:flex border border-gray-100 items-center justify-center"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); nextBanner(); }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all hidden sm:flex border border-gray-100 items-center justify-center"
          aria-label="Next banner"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="mt-4 sm:mt-6 flex justify-center items-center gap-1.5 sm:gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 sm:w-8 bg-blue-600" : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
