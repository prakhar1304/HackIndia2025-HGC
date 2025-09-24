"use client"

import { Brain, Users, Layers, Zap } from "lucide-react"

export default function UseCasesSection() {
  return (
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
  )
}
