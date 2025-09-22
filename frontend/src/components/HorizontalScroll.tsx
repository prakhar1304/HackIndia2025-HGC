"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar overflow-x-hidden px-2"
      >
        <div className="mx-auto grid w-full max-w-7xl auto-cols-[280px] grid-flow-col gap-4 pb-2">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto flex w-full max-w-7xl items-center justify-between">
        <Button
          size="icon"
          variant="outline"
          className="pointer-events-auto ml-[-6px] shadow-[4px_4px_0_0_#000]"
          onClick={() => scrollBy(-320)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="pointer-events-auto mr-[-6px] shadow-[4px_4px_0_0_#000]"
          onClick={() => scrollBy(320)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}


