"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
};

export default function HeroCarousel({
  slides,
  intervalMs = 2000,
  className,
}: {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const slide = slides[index];

  return (
    <div className={cn("relative aspect-[16/6] w-full overflow-hidden rounded-2xl border shadow-md", className)}>
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white max-w-lg">
        <div className="inline-block rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold tracking-wider">
          Featured
        </div>
        <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">{slide.title}</h2>
        {slide.subtitle && (
          <p className="mt-2 text-sm text-white/90 md:text-base">{slide.subtitle}</p>
        )}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-8 rounded-full bg-white/40 transition-all",
              i === index && "bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
}


