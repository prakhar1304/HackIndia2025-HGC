"use client"

import { BookOpen } from "lucide-react"

export default function ExplainableAISection() {
  return (
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
  )
}
