"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface HeroSectionProps {
  onFindMovie: () => void
}

export default function HeroSection({ onFindMovie }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-purple-900 via-transparent to-purple-900 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-16 h-16 bg-purple-400 rounded-full border-4 border-black shadow-[8px_8px_0_0_#000] animate-bounce" />
      <div className="absolute bottom-20 right-10 w-12 h-12 bg-yellow-400 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] animate-pulse" />
      <div className="absolute top-1/2 right-20 w-8 h-8 bg-green-400 rounded-full border-2 border-black shadow-[4px_4px_0_0_#000] animate-ping" />

      <div className="max-w-6xl w-full text-center relative z-10">
        <div className="bg-white rounded-3xl border-6 border-black shadow-[20px_20px_0_0_#000] p-12 mb-8 transform hover:rotate-1 transition-transform duration-300">
          <h1 className="text-5xl md:text-7xl font-black leading-tight text-black mb-6 text-balance animate-pulse">
            Smarter Movie Picks,{" "}
            <span className="text-purple-600 animate-bounce inline-block">Backed by Reason</span>
          </h1>
          <div className="text-xl md:text-2xl font-bold text-gray-700 mb-8 max-w-3xl mx-auto text-pretty">
            Content, Collaboration & Context — all in one{" "}
            <div className="mt-6">
              <span className="whitespace-nowrap bg-purple-200 px-2 py-1 rounded border-2 border-black">
                MeTTa powered engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button
            onClick={onFindMovie}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xl px-10 py-6 border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-all transform hover:scale-110 hover:-rotate-2"
          >
            <Search className="mr-3 w-8 h-8 animate-spin" />
            Find Your Next Movie
          </Button>
        </div>
      </div>
    </section>
  )
}
