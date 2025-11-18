"use client"

import type React from "react"
import { Search, Star, Users, Clock, Zap, Target } from "lucide-react"

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

export default function KeyHighlightsSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-16 text-black">Why CuRecsAlpha1?</h2>
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
  )
}
