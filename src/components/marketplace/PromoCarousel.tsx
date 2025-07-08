'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const promos = [
  {
    id: 1,
    title: "Flash Sale - Up to 70% Off",
    subtitle: "Limited time only",
    image: "/placeholder.svg",
    link: "/products?sale=flash",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500"
  },
  {
    id: 2,
    title: "Free Shipping on Orders $50+",
    subtitle: "Shop now and save",
    image: "/placeholder.svg",
    link: "/products?shipping=free",
    bgColor: "bg-gradient-to-r from-blue-500 to-purple-500"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Discover fresh products",
    image: "/placeholder.svg",
    link: "/products?sort=newest",
    bgColor: "bg-gradient-to-r from-green-500 to-teal-500"
  }
];

export default function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  return (
    <section className="relative h-48 md:h-64 overflow-hidden bg-neutral-100 group font-sans">
      <div className="relative h-full">
        {promos.map((promo, index) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full ${promo.bgColor} flex items-center justify-center`}>
              <div className="text-center text-white px-4 py-4 md:px-8 md:py-8">
                <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 font-sans">{promo.title}</h2>
                <p className="text-base md:text-lg mb-4 md:mb-6 opacity-90 font-sans">{promo.subtitle}</p>
                <a
                  href={promo.link}
                  className="inline-block bg-white text-neutral-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-neutral-100 transition-colors text-sm md:text-base font-sans"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation arrows - subtle, only on desktop, visible on hover/focus */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 p-1.5 rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-neutral-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 text-neutral-700" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/90 p-1.5 rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-neutral-200"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 text-neutral-700" />
      </button>
      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 