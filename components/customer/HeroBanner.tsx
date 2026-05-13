"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cdnUrl } from "@/lib/utils";
import { adsApi, AdCampaign } from "@/lib/adsApi";
import { useRouter } from "next/navigation";

const DEFAULT_SLIDES = [
  {
    id: "1",
    image: cdnUrl("/banners/banner1.png"),
    title: "Elevate Your Style - Menswear from ₹799",
    cta: "Shop Now",
  },
  {
    id: "2",
    image: cdnUrl("/banners/banner2.png"),
    title: "Sarees & Kurtas - Ethnic Festive Edit from ₹999",
    cta: "Shop Now",
  },
  {
    id: "3",
    image: cdnUrl("/banners/banner3.png"),
    title: "Fun Fits for Little Ones - Kids Fashion from ₹299",
    cta: "Shop Now",
  },
];

export default function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const trackedImpressions = useRef(new Set<string>());

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await adsApi.listActive('home_hero');
        setAds(res.ads);
      } catch (err) {
        console.error("Failed to load hero ads:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  const currentSlides = ads.length > 0 ? ads : DEFAULT_SLIDES;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setSelectedIndex(idx);
    
    if (ads.length > 0) {
      const ad = ads[idx];
      if (ad && !trackedImpressions.current.has(ad.id)) {
        trackedImpressions.current.add(ad.id);
        adsApi.recordImpression(ad.id).catch(console.error);
      }
    }
  }, [emblaApi, ads]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const handleSlideClick = (slide: any) => {
    if (ads.length > 0) {
      adsApi.recordClick(slide.id).catch(console.error);
      router.push(slide.target_url || `/products/${slide.product_id}`);
    }
  };

  const handleNext = () => emblaApi?.scrollNext();
  const handlePrev = () => emblaApi?.scrollPrev();

  return (
    <div className="w-full pb-6 pt-2">
      <div className="relative w-full px-4 md:px-0 group max-w-[1280px] mx-auto overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {loading ? (
             <div className="flex-[0_0_100%] min-w-0 relative px-1">
               <div className="w-full h-[180px] md:h-[400px] bg-gray-100 animate-pulse rounded-2xl md:rounded-3xl" />
             </div>
          ) : (
            currentSlides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => handleSlideClick(slide)}
                className="flex-[0_0_100%] min-w-0 relative px-1 cursor-pointer"
              >
                <div className="relative w-full h-[180px] md:h-[400px] overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] isolate bg-[#F8FAFC]">
                  <img
                    src={(slide as AdCampaign).banner_url || (slide as typeof DEFAULT_SLIDES[0]).image}
                    alt={(slide as AdCampaign).headline || (slide as typeof DEFAULT_SLIDES[0]).title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col justify-end h-full pointer-events-none">
                    <h2 className="text-xl md:text-5xl font-black text-white leading-[1.1] mb-3 tracking-tight">
                      {(slide as AdCampaign).headline || (slide as typeof DEFAULT_SLIDES[0]).title}
                    </h2>
                    
                    <button className="self-start mt-2 pointer-events-auto bg-white/90 backdrop-blur-md text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-white transition-all flex items-center gap-2">
                      {(slide as AdCampaign).cta_text || (slide as typeof DEFAULT_SLIDES[0]).cta}
                    </button>
                    {ads.length > 0 && (
                      <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded">Ad</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handlePrev}
          className="hidden md:flex absolute top-1/2 left-6 -translate-y-1/2 z-20 items-center justify-center rounded-full bg-white/90 hover:bg-white active:bg-gray-100 shadow-md border border-gray-100 w-11 h-11 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute top-1/2 right-6 -translate-y-1/2 z-20 items-center justify-center rounded-full bg-white/90 hover:bg-white active:bg-gray-100 shadow-md border border-gray-100 w-11 h-11 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          aria-label="Next banner"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
        </button>
      </div>

      {/* ══════ PROGRESS BAR INDICATORS ══════ */}
      <div className="mt-3 sm:mt-5 flex justify-center items-center gap-1.5 sm:gap-2 px-4">
        {currentSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="relative h-[3px] sm:h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{
              width: i === selectedIndex ? 32 : 16,
              background: i === selectedIndex ? "#1A6FD4" : "#D1D5DB",
            }}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
