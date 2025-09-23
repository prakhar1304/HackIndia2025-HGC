"use client"

import type React from "react"
import { useLocalAuth } from "@/context/LocalAuthContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SearchModal from "@/components/SearchModal"
import MovieCursorTrail from "@/components/MovieCursorTrail"
import PageLoader from "@/components/PageLoader"
import { Search, Star, Users, Clock, Zap, Target, BookOpen, Brain, Layers } from "lucide-react"

function FeatureCard({
  icon,
  title,
  description,
  color,
  iconColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  iconColor: string
}) {
  return (
    <div
      className={`${color} border-4 rounded-2xl p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105 cursor-pointer hover:-rotate-1`}
    >
      <div className={`${iconColor} mb-4`}>{icon}</div>
      <h3 className="text-xl font-black mb-3 text-black">{title}</h3>
      <p className="text-sm font-semibold text-gray-700">{description}</p>
    </div>
  )
}

export default function HomePage() {
  const { userId } = useLocalAuth()
  const [inputUserId, setInputUserId] = useState("")
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [loadingDone, setLoadingDone] = useState(false)
  const router = useRouter()

  

  const handleFindMovie = () => {
    setShowSearchModal(true)
  }



  return (
    <div className="relative">
      {/* Real website underneath */}
      <main className={`min-h-screen bg-white transition-opacity duration-500 ${loadingDone ? 'opacity-100' : 'opacity-50'}`}>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-purple-400 rounded-full border-4 border-black shadow-[8px_8px_0_0_#000] animate-bounce" />
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-yellow-400 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] animate-pulse" />
          <div className="absolute top-1/2 right-20 w-8 h-8 bg-green-400 rounded-full border-2 border-black shadow-[4px_4px_0_0_#000] animate-ping" />

          <div className="max-w-6xl w-full text-center relative z-10">
            <div className="bg-white rounded-3xl border-6 border-black shadow-[20px_20px_0_0_#000] p-12 mb-8 transform hover:rotate-1 transition-transform duration-300">
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-black mb-6 text-balance animate-pulse">
                Smarter Movie Picks,{" "}
                <span className="text-purple-600 animate-bounce inline-block">Backed by Reason</span>
              </h1>
              <p className="text-xl md:text-2xl font-bold text-gray-700 mb-8 max-w-3xl  mx-auto text-pretty">
                Content, Collaboration & Context — all in one{" "}

                <div className="mt-6">
  <span className="whitespace-nowrap bg-purple-200 px-2 py-1 rounded border-2 border-black">
    MeTTa powered engine
  </span>
</div>
                {/* <span className="whitespace-nowrap mt-10 bg-purple-200 px-2 py-1 rounded border-2 border-black">MeTTa powered engine</span>. */}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button
                onClick={handleFindMovie}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xl px-10 py-6 border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-all transform hover:scale-110 hover:-rotate-2"
              >
                <Search className="mr-3 w-8 h-8 animate-spin" />
                Find Your Next Movie
              </Button>

              {/* <div className="bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000] p-6 max-w-sm transform hover:scale-105 transition-all">
                <p className="text-sm font-bold text-gray-600 mb-3">Quick Start:</p>
                <input
                  type="text"
                  value={inputUserId}
                  onChange={(e) => setInputUserId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter username"
                  className="w-full p-3 text-lg font-bold border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] mb-3 focus:shadow-[8px_8px_0_0_#000] transition-shadow"
                />
                <Button
                  onClick={handleLogin}
                  disabled={!inputUserId.trim()}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all"
                >
                  Start Exploring
                </Button>
              </div> */}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-black to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-purple-600 border-4 border-white rounded-full px-6 py-3 shadow-[8px_8px_0_0_#fff] mb-6">
                <Brain className="w-8 h-8 text-white animate-pulse" />
                <span className="text-xl font-black text-white">MeTTa Powered</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
                Use Cases of <span className="text-purple-300">MeTTa</span> in MeTTa Match
              </h2>
              <p className="text-xl font-bold text-purple-200 max-w-3xl mx-auto">
                Discover the three powerful layers that make our recommendations smarter than ever
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Collaborative Search */}
              <div className="group">
                <div className="bg-white text-black rounded-3xl border-6 border-purple-400 shadow-[16px_16px_0_0_#a855f7] p-8 transform hover:scale-105 hover:-rotate-2 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-600 rounded-full p-4 border-4 border-black shadow-[6px_6px_0_0_#000]">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-purple-100 border-2 border-black rounded-lg px-3 py-1">
                      <span className="text-sm font-black">👥 COLLABORATIVE</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-4">Search Between Users</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Discover movies loved by people who share your taste. MeTTa connects user preferences to find your{" "}
                    <span className="whitespace-nowrap bg-yellow-200 px-2 py-1 rounded border-2 border-black">"movie twins."</span>
                  </p>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" />
                    <div
                      className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>

              {/* Content-Based Search */}
              <div className="group">
                <div className="bg-white text-black rounded-3xl border-6 border-green-400 shadow-[16px_16px_0_0_#22c55e] p-8 transform hover:scale-105 hover:rotate-2 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-green-600 rounded-full p-4 border-4 border-black shadow-[6px_6px_0_0_#000]">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-green-100 border-2 border-black rounded-lg px-3 py-1">
                      <span className="text-sm font-black">🎬 CONTENT-BASED</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-4">Layered Search</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    Explore recommendations built on genres, directors, actors, and mood. Each layer adds depth, giving
                    you{" "}
                    <span className="bg-green-200 px-2 py-1 rounded border-2 border-black">
                      smarter, personalized results.
                    </span>
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 bg-green-200 rounded border-2 border-black animate-pulse" />
                    <div
                      className="h-2 bg-green-300 rounded border-2 border-black animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 bg-green-400 rounded border-2 border-black animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>

              {/* Hybrid Power */}
              <div className="group lg:col-span-1">
                <div className="bg-white text-black rounded-3xl border-6 border-yellow-400 shadow-[16px_16px_0_0_#eab308] p-8 transform hover:scale-105 hover:-rotate-1 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-yellow-600 rounded-full p-4 border-4 border-black shadow-[6px_6px_0_0_#000]">
                      <Zap className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="bg-yellow-100 border-2 border-black rounded-lg px-3 py-1">
                      <span className="text-sm font-black">⚡ HYBRID</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-4">Hybrid Power</h3>
                  <p className="text-lg font-bold text-gray-700 mb-6">
                    By combining collaborative and content-based layers, MetaReel uncovers{" "}
                    <span className="bg-yellow-200 px-2 py-1 rounded border-2 border-black">hidden gems</span> you'd
                    never find through simple search.
                  </p>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-green-400 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] animate-spin" />
                      <div className="absolute inset-2 bg-yellow-400 rounded-full border-2 border-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Highlights Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16 text-black">Why MetaReel?</h2>
            <p className="text-xl font-bold text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Because you deserve recommendations that make sense, not guesses.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Search className="w-8 h-8" />}
                title="Layered Search"
                description="Explore by genre, actor, director, or mood."
                color="bg-blue-100 border-blue-500"
                iconColor="text-blue-600"
              />

              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Collaborative Discovery"
                description="Match with users who share your taste."
                color="bg-green-100 border-green-500"
                iconColor="text-green-600"
              />

              <FeatureCard
                icon={<Star className="w-8 h-8" />}
                title="Content-Aware Recs"
                description="Get picks based on what you already love."
                color="bg-purple-100 border-purple-500"
                iconColor="text-purple-600"
              />

              <FeatureCard
                icon={<Clock className="w-8 h-8" />}
                title="Time-Smart Suggestions"
                description="Morning, evening, or night — tailored for you."
                color="bg-orange-100 border-orange-500"
                iconColor="text-orange-600"
              />

              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="Movie Match-Up"
                description="Compare two movies side by side."
                color="bg-yellow-100 border-yellow-500"
                iconColor="text-yellow-600"
              />

              <FeatureCard
                icon={<Target className="w-8 h-8" />}
                title="Personal Watch Advice"
                description="Not sure what to pick? Let the system choose for you."
                color="bg-red-100 border-red-500"
                iconColor="text-red-600"
              />
            </div>
          </div>
        </section>

        {/* Explainable AI Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl border-4 border-black shadow-[20px_20px_0_0_#000] p-12 transform hover:rotate-1 transition-transform duration-300">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-purple-600 animate-bounce" />
              <h2 className="text-4xl font-black mb-6 text-black">Explainable AI</h2>
              <p className="text-xl font-bold text-gray-700 mb-8">Every recommendation comes with a reason.</p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-purple-50 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105">
                  <h3 className="font-black text-lg mb-2">Know WHY</h3>
                  <p className="text-sm font-semibold text-gray-600">we recommend a movie</p>
                </div>
                <div className="bg-purple-50 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105">
                  <h3 className="font-black text-lg mb-2">Discover</h3>
                  <p className="text-sm font-semibold text-gray-600">hidden gems beyond Netflix-style black-box AI</p>
                </div>
                <div className="bg-purple-50 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105">
                  <h3 className="font-black text-lg mb-2">Perfect Match</h3>
                  <p className="text-sm font-semibold text-gray-600">Your taste + others' wisdom + time context</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Movie Cursor Trail Section */}
        <MovieCursorTrail />
      </main>

      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

      {/* Loader on top until loading is done */}
      {!loadingDone && (
        <PageLoader onComplete={() => setLoadingDone(true)} />
      )}
    </div>
  )
}
