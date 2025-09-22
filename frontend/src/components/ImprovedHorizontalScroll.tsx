"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImprovedHorizontalScrollProps {
  children: React.ReactNode
  className?: string
  cardWidth?: number
  gap?: number
}

export default function ImprovedHorizontalScroll({
  children,
  className = "",
  cardWidth = 280,
  gap = 16,
}: ImprovedHorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    const updateScrollState = () => {
      if (!scrollRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)

      // Calculate how many cards can fit
      const containerWidth = clientWidth
      const cardWithGap = cardWidth + gap
      const fits = Math.floor(containerWidth / cardWithGap)
      setVisibleCards(fits)
    }

    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      updateScrollState()
      scrollContainer.addEventListener("scroll", updateScrollState)
      window.addEventListener("resize", updateScrollState)

      return () => {
        scrollContainer.removeEventListener("scroll", updateScrollState)
        window.removeEventListener("resize", updateScrollState)
      }
    }
  }, [cardWidth, gap])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    const scrollAmount = visibleCards * (cardWidth + gap)
    const newScrollLeft =
      direction === "left" ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitScrollbarWidth: "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
