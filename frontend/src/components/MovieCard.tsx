"use client"

import Image from "next/image"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ThumbsUp, ThumbsDown, Plus, RotateCcw } from "lucide-react"

export type Movie = {
  id: string
  title: string
  poster: string
  genres: string[]
  reason: "content" | "collab" | "context"
  year?: number
}

export type RecommendationData = {
  match_score: number
  reason?: {
    title: string
    summary: string
    points: string[]
  }
  key_matches?: string[]
}

const reasonLabel: Record<Movie["reason"], string> = {
  content: "Content-based",
  collab: "Collaborative",
  context: "Time-of-day Context",
}

export default function MovieCard({
  movie,
  onFeedback,
  onAdd,
  likedState,
  watched,
  accent,
  recommendationData,
}: {
  movie: Movie
  onFeedback?: (id: string, liked: boolean) => void
  onAdd?: (id: string) => void
  likedState?: boolean | null
  watched?: boolean
  accent?: "green" | "purple" | "blue" | "yellow" | "red" | "orange" | "gray" | "emerald"
  recommendationData?: RecommendationData
}) {
  const [imgError, setImgError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const hasValidPoster =
    !!movie.poster &&
    movie.poster !== "N/A" &&
    (movie.poster.startsWith("http://") || movie.poster.startsWith("https://") || movie.poster.startsWith("/"))
  const posterSrc = !imgError && hasValidPoster ? movie.poster : "/home/noImage.svg"
  const likeActive = likedState === true
  const dislikeActive = likedState === false
  const watchedActive = watched === true
  const accentColor: NonNullable<typeof accent> = (accent || "gray") as any
  const baseBadge = "mr-2 mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-extrabold leading-none shadow-[3px_3px_0_0_#000] border-2"
  const badgeAccentClasses: Record<NonNullable<typeof accent>, string> = {
    green: "bg-green-200 border-green-700 text-green-900",
    purple: "bg-purple-200 border-purple-700 text-purple-900",
    blue: "bg-blue-200 border-blue-700 text-blue-900",
    yellow: "bg-yellow-200 border-yellow-700 text-yellow-900",
    red: "bg-red-200 border-red-700 text-red-900",
    orange: "bg-orange-200 border-orange-700 text-orange-900",
    gray: "bg-gray-200 border-gray-700 text-gray-900",
    emerald: "bg-emerald-200 border-emerald-700 text-emerald-900",
  }

  const handleCardClick = () => {
    if (recommendationData) {
      setIsFlipped(!isFlipped)
    }
  }

  return (
    <div 
      className="h-[460px] w-[280px] m-0 perspective-1000 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front side - Original card */}
        <Card className="absolute w-full h-full overflow-hidden border-2 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all bg-white backface-hidden">
          {/* Poster section */}
          <div className="relative h-[300px] w-full overflow-hidden">
            <Image
              src={posterSrc}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-contain object-top bg-white"
              onError={() => setImgError(true)}
              priority
            />
            <div className="absolute left-3 top-3 flex gap-2">
              {movie.year ? (
                <Badge variant="secondary" className="border-black/10">
                  {movie.year}
                </Badge>
              ) : null}
              {/* {recommendationData && (
                <Badge className="bg-blue-600 text-white border-black/20 cursor-pointer">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Flip
                </Badge>
              )} */}
            </div>
          </div>
          <CardHeader className="pb-2 pt-1">
            <CardTitle className="text-lg font-extrabold">{movie.title}</CardTitle>
            <CardDescription>
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className={`${baseBadge} ${badgeAccentClasses[accentColor]}`}
                >
                  {g}
                </span>
              ))}
            </CardDescription>
          </CardHeader>
          <CardFooter className="relative z-10 gap-2 pt-0 flex-wrap">
            <Button variant={likeActive ? "default" : "outline"} size="sm" onClick={(e) => {
              e.stopPropagation()
              onFeedback?.(movie.id, true)
            }}>
              <ThumbsUp className="mr-1 size-4" />
              Like
            </Button>
            <Button variant={dislikeActive ? "default" : "outline"} size="sm" onClick={(e) => {
              e.stopPropagation()
              onFeedback?.(movie.id, false)
            }}>
              <ThumbsDown className="mr-1 size-4" />
              Dislike
            </Button>
            <div className="basis-full h-0" />
            <Button
              size="sm"
              className="mt-2"
              variant={watchedActive ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation()
                onAdd?.(movie.id)
              }}
            >
              <Plus className="mr-1 size-4" />
              Add to History
            </Button>
          </CardFooter>
          <img
            src="/home/lgrad.png"
            alt=""
            className="pointer-events-none absolute -bottom-21 -right-28 h-56 w-[100rem] scale-200 select-none"
          />
          <div className="pointer-events-none absolute bottom-2 right-2 z-0 h-32 w-32 bg-[url('/home/gradient.svg')] bg-no-repeat bg-contain" />
        </Card>

        {/* Back side - Recommendation details */}
        {recommendationData && (
          <Card className="absolute w-full h-full overflow-hidden border-2 shadow-[6px_6px_0_0_#000] bg-gradient-to-br from-blue-50 to-purple-50 rotate-y-180 backface-hidden">
            <div className="p-6 h-full flex flex-col">
              {/* Title */}
              <div className="mb-2">
                <h3 className="text-lg font-extrabold text-gray-800">{movie.title}</h3>
              </div>

              {/* Match score */}
              <div className="mb-6">
                <Badge className="bg-green-500 text-white border-green-700">
                  {recommendationData.match_score}% Match
                </Badge>
              </div>

              {/* Reason points */}
              {recommendationData.reason && recommendationData.reason.points && (
                <div className="flex-1 overflow-y-auto">
                  <ul className="space-y-2">
                    {recommendationData.reason.points.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
