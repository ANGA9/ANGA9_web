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
    image: cdnUrl("/banners/ban1.png"),
    title: "Festive Ethnic Edit - Sarees & Kurtas from ₹999",
  },
  {
    id: "2",
    image: cdnUrl("/banners/ban2.png"),
    title: "Elevate Your Style - Menswear from ₹799",
  },
  {
    id: "3",
    image: cdnUrl("/banners/ban3.png"),
    title: "Fun Fits for Little Ones - Kids Fashion from ₹299",
  },
  {
    id: "4",
    image: cdnUrl("/banners/ban4.png"),
    title: "Train Harder Look Better - Activewear from ₹599",
  },
  {
    id: "5",
    image: cdnUrl("/banners/ban5.png"),
    title: "Sleep in Pure Luxury - Bed Linen from ₹899",
  },
  {
    id: "6",
    image: cdnUrl("/banners/ban6.png"),
    title: "Spa Comfort at Home - Bath Linen from ₹449",
  },
  {
    id: "7",
    image: cdnUrl("/banners/ban7.png"),
    title: "Transform Your Living Space - Rugs & Curtains from ₹1299",
  },
  {
    id: "8",
    image: cdnUrl("/banners/ban8.png"),
    title: "Style Every Corner - Living Decor from ₹349",
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
          {currentSlides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => handleSlideClick(slide)}
              className="flex-[0_0_100%] min-w-0 relative px-1 cursor-pointer"
            >
                <div className="relative w-full aspect-[11/5] md:aspect-[5/2] overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] isolate bg-[#F8FAFC]">
                  <img
                    src={(slide as AdCampaign).banner_url || (slide as typeof DEFAULT_SLIDES[0]).image}
                    alt={(slide as AdCampaign).headline || (slide as typeof DEFAULT_SLIDES[0]).title}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${loading ? 'opacity-50' : 'opacity-100'}`}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {ads.length > 0 && (
                    <span className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">Ad</span>
                  )}
                </div>
              </div>
            ))
          }
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
