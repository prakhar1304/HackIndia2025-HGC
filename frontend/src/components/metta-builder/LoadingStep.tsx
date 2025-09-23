"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Code, Database, Cpu, CheckCircle } from "lucide-react"

interface LoadingStepProps {
  onComplete: () => void
}

export default function LoadingStep({ onComplete }: LoadingStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)

  const phases = [
    { id: 0, text: "Analyzing your rules...", icon: Code, duration: 2000 },
    { id: 1, text: "Processing data structure...", icon: Database, duration: 2500 },
    { id: 2, text: "Generating MeTTa syntax...", icon: Cpu, duration: 2000 },
    { id: 3, text: "Optimizing knowledge base...", icon: CheckCircle, duration: 1500 }
  ]

  useEffect(() => {
    const totalDuration = 8000 // 8 seconds total
    const interval = 50 // Update every 50ms
    const increment = 100 / (totalDuration / interval)

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(progressTimer)
          setTimeout(onComplete, 500) // Small delay before completing
          return 100
        }
        return newProgress
      })
    }, interval)

    // Phase transitions
    const phaseTimers = [
      setTimeout(() => setCurrentPhase(1), 2000),
      setTimeout(() => setCurrentPhase(2), 4500),
      setTimeout(() => setCurrentPhase(3), 6500)
    ]

    return () => {
      clearInterval(progressTimer)
      phaseTimers.forEach(timer => clearTimeout(timer))
    }
  }, [onComplete])

  const CurrentIcon = phases[currentPhase]?.icon || Code

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 border-4 border-black shadow-[12px_12px_0_0_#000] bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <h2 className="text-3xl font-black text-black mb-6">Preparing MeTTa</h2>
          <p className="text-lg font-bold text-gray-700 mb-8">
            Your intelligent knowledge base is being generated
          </p>

          {/* Main Loading Animation */}
          <div className="mb-8">
            <div className="relative">
              {/* Spinning Icon */}
              <div className="mx-auto w-24 h-24 border-4 border-purple-200 rounded-full flex items-center justify-center bg-white shadow-[8px_8px_0_0_#000] mb-6">
                <CurrentIcon className="w-12 h-12 text-purple-600 animate-pulse" />
              </div>
              
              {/* Rotating Ring */}
              <div className="absolute inset-0 mx-auto w-24 h-24 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
            </div>

            {/* Current Phase Text */}
            <div className="bg-white border-4 border-black rounded-lg p-4 shadow-[6px_6px_0_0_#000] mb-6">
              <p className="text-lg font-black text-gray-800 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                {phases[currentPhase]?.text || "Preparing MeTTa..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-200 border-4 border-black rounded-full h-6 shadow-[4px_4px_0_0_#000] overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out rounded-r-full"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Percentage */}
            <p className="text-sm font-bold text-gray-600 mt-3">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Phase Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {phases.map((phase, index) => {
              const PhaseIcon = phase.icon
              const isCompleted = currentPhase > index
              const isCurrent = currentPhase === index
              
              return (
                <div
                  key={phase.id}
                  className={`p-4 border-2 rounded-lg transition-all duration-500 ${
                    isCompleted
                      ? 'border-green-500 bg-green-50'
                      : isCurrent
                      ? 'border-purple-500 bg-purple-50 shadow-[3px_3px_0_0_#000]'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <PhaseIcon 
                      className={`w-6 h-6 mb-2 ${
                        isCompleted
                          ? 'text-green-600'
                          : isCurrent
                          ? 'text-purple-600 animate-pulse'
                          : 'text-gray-400'
                      }`}
                    />
                    <p className={`text-xs font-bold text-center ${
                      isCompleted
                        ? 'text-green-800'
                        : isCurrent
                        ? 'text-purple-800'
                        : 'text-gray-600'
                    }`}>
                      {phase.text.split(' ').slice(0, 2).join(' ')}
                    </p>
                    {isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fun Facts */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
            <p className="text-sm font-bold text-blue-800 mb-2">Did you know?</p>
            <p className="text-sm text-blue-700">
              MeTTa (Meta Type Talk) is a powerful language for symbolic AI that combines 
              logic programming with neural networks for advanced reasoning capabilities.
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center mt-6 space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
