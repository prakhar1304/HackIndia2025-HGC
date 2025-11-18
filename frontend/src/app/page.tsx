"use client"

import { useState } from "react"
import SearchModal from "@/components/SearchModal"
import MovieCursorTrail from "@/components/MovieCursorTrail"
import PageLoader from "@/components/PageLoader"
import HeroSection from "@/components/sections/HeroSection"
import UseCasesSection from "@/components/sections/UseCasesSection"
import KeyHighlightsSection from "@/components/sections/KeyHighlightsSection"
import ExplainableAISection from "@/components/sections/ExplainableAISection"

export default function HomePage() {
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [loadingDone, setLoadingDone] = useState(false)

  const handleFindMovie = () => {
    setShowSearchModal(true)
  }

  return (
    <div className="relative">
      {/* Real website underneath */}
      <main className={`min-h-screen bg-white transition-opacity duration-500 `}>
        {/* Hero Section */}
        <HeroSection onFindMovie={handleFindMovie} />

        {/* Use Cases Section */}
        <UseCasesSection />

        {/* Key Highlights Section */}
        <KeyHighlightsSection />

        {/* Explainable AI Section */}
        <ExplainableAISection />

        {/* Movie Cursor Trail Section */}
        <MovieCursorTrail />
      </main>

      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

  
    </div>
  )
}
