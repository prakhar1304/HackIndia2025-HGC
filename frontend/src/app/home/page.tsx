"use client"

import HeroCarousel from "@/components/HeroCarousel"
import MovieCard from "@/components/MovieCard"
import { heroSlides, movies as allMovies } from "@/lib/dummy"
import { useEffect, useMemo, useState } from "react"
import { getCollabRecommendations } from "@/services/local/recommendations"
import { useLocalAuth } from "@/context/LocalAuthContext"
import { useRecommendationsCache } from "@/hooks/useRecommendationsCache"
import { useCollaborativeSearchCache } from "@/hooks/useCollaborativeSearchCache"
import { useIndiaMoviesCache } from "@/hooks/useIndiaMoviesCache"
import { getTopRated, getByGenre } from "@/services/ngrok/movies"
import { recommendBySeedMovie, recommendForUser } from "@/services/ngrok/recommendations"
import { patchLocalUser } from "@/services/local/users"
import { likeNgrok, addToHistoryNgrok, unlikeNgrok } from "@/services/ngrok/users"
import ImprovedHorizontalScroll from "@/components/HorizontalScroll"

export default function HomePage() {
  const { userId } = useLocalAuth()
  const [feedback, setFeedback] = useState<Record<string, boolean>>({})
  const [history, setHistory] = useState<string[]>([])


  console.log("userId", userId);
  
  // Use cache hooks for MeTTa APIs
  const { recommendations: recs, loading: recsLoading, isFromCache: recsFromCache } = useRecommendationsCache(userId)
  const { recommendations: collaborativeRecs, loading: collabLoading, isFromCache: collabFromCache, forceRefresh: refreshCollaborative } = useCollaborativeSearchCache(userId)
  
  // Debug function to test collaborative refresh
  if (typeof window !== 'undefined') {
    (window as any).refreshCollaborative = refreshCollaborative;
    console.log('🔧 Debug: Call refreshCollaborative() to force refresh collaborative data');
  }
  const { movies: india, loading: indiaLoading, isFromCache: indiaFromCache } = useIndiaMoviesCache()
  
  const [topRated, setTopRated] = useState<any[]>([])
  const [action, setAction] = useState<any[]>([])
  const [seedMovie, setSeedMovie] = useState<any[]>([])
  const [userRecs, setUserRecs] = useState<any[]>([])
  const [comedy, setComedy] = useState<any[]>([])
  const [thriller, setThriller] = useState<any[]>([])

  const isImdb = (value: string) => /^tt\d+$/i.test(value)

  async function handleFeedback(id: string, liked: boolean) {
    setFeedback((prev) => ({ ...prev, [id]: liked }))
    const localId = localStorage.getItem("localUserId")
    const ngId = localStorage.getItem("ngrokUserId")
    const imdbId = id.replace(/^m_/, "")
    try {
      if (localId && liked && isImdb(imdbId)) {
        await patchLocalUser(localId, { merge: true, liked: ["m_" + imdbId] })
      }
      if (ngId && isImdb(imdbId)) {
        if (liked) await likeNgrok(ngId, imdbId)
        else await unlikeNgrok(ngId, imdbId)
      }
    } catch {}
  }

  async function handleAdd(id: string) {
    setHistory((prev) => (prev.includes(id) ? prev : [...prev, id]))
    const localId = localStorage.getItem("localUserId")
    const ngId = localStorage.getItem("ngrokUserId")
    const imdbId = id.replace(/^m_/, "")
    try {
      if (localId && isImdb(imdbId)) {
        await patchLocalUser(localId, { merge: true, watched: ["m_" + imdbId] })
      }
      if (ngId && isImdb(imdbId)) {
        console.log("adding to history", ngId, imdbId);
        
        await addToHistoryNgrok(ngId, imdbId)
      }
    } catch {}
  }

  const movies = useMemo(() => allMovies, [])

  useEffect(() => {
    // Sequential loading for MeTTa APIs only
    const loadMeTTaAPIs = async () => {
      try {
        console.log('�� Loading MeTTa APIs sequentially...')
        
        // MeTTa APIs are now handled by cache hooks
        
        // India movies now handled by cache hook
        
        console.log('✅ MeTTa APIs loaded successfully')
        
      } catch (error) {
        console.error('❌ Error loading MeTTa APIs:', error)
        // setRecs([]) - handled by cache hooks
        // setIndia([]) - handled by cache hook
      }
    }

    // Load non-MeTTa APIs in parallel (these are safe)
    const loadNonMeTTaAPIs = () => {
      getTopRated(5)
        .then(setTopRated)
        .catch(() => setTopRated([]))
      getByGenre("Action", 10)
        .then(setAction)
        .catch(() => setAction([]))
      getByGenre("Comedy", 10)
        .then(setComedy)
        .catch(() => setComedy([]))
      getByGenre("Thriller", 10)
        .then(setThriller)
        .catch(() => setThriller([]))
      
      const ngId = localStorage.getItem("ngrokUserId") || undefined
      recommendBySeedMovie("tt0250223", ngId)
        .then(setSeedMovie)
        .catch(() => setSeedMovie([]))
      if (ngId)
        recommendForUser(ngId)
          .then(setUserRecs)
          .catch(() => setUserRecs([]))
    }

    // Execute loading strategy
    loadNonMeTTaAPIs()
  }, [userId])

  const movieRows = [
    {
      title: "TasteMatrix" + (recsFromCache ? "" : ""),
      data: recs,
      bgColor: "bg-gradient-to-r from-green-50 to-green-100",
      titleColor: "text-green-800",
      borderColor: "border-green-300",
      reason: "collab" as const,
      metta: true,
      accent: "green" as const,
    },
    {
      title: "Community Picks" + (collabFromCache ? "" : ""),
      data: collaborativeRecs,
      bgColor: "bg-gradient-to-r from-teal-50 to-teal-100",
      titleColor: "text-teal-800",
      borderColor: "border-teal-300",
      reason: "collaborative" as const,
      metta: true,
      accent: "teal" as const,
    },
    {
      title: "Because you watched Asterix & Obelix",
      data: seedMovie,
      bgColor: "bg-gradient-to-r from-purple-50 to-purple-100",
      titleColor: "text-purple-800",
      borderColor: "border-purple-300",
      reason: "content" as const,
      accent: "purple" as const,
    },
    {
      title: "India Picks" + (indiaFromCache ? "" : ""),
      data: india,
      bgColor: "bg-gradient-to-r from-emerald-50 to-emerald-100",
      titleColor: "text-emerald-800",
      borderColor: "border-emerald-300",
      reason: "content" as const,
      metta: true,
      accent: "emerald" as const,
    },
    // {
    //   title: "Just for you",
    //   data: userRecs,
    //   bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
    //   titleColor: "text-blue-800",
    //   borderColor: "border-blue-300",
    //   reason: "content" as const,
    //   metta: true,
    //   accent: "blue" as const,
    // },
    {
      title: "Top Rated",
      data: topRated,
      bgColor: "bg-gradient-to-r from-yellow-50 to-yellow-100",
      titleColor: "text-yellow-800",
      borderColor: "border-yellow-300",
      reason: "content" as const,
      accent: "yellow" as const,
    },
    {
      title: "Action Picks",
      data: action,
      bgColor: "bg-gradient-to-r from-red-50 to-red-100",
      titleColor: "text-red-800",
      borderColor: "border-red-300",
      reason: "content" as const,
      accent: "red" as const,
    },
    {
      title: "Comedy Gold",
      data: comedy,
      bgColor: "bg-gradient-to-r from-orange-50 to-orange-100",
      titleColor: "text-orange-800",
      borderColor: "border-orange-300",
      reason: "content" as const,
      accent: "orange" as const,
    },
    {
      title: "Thriller Zone",
      data: thriller,
      bgColor: "bg-gradient-to-r from-gray-50 to-gray-100",
      titleColor: "text-gray-800",
      borderColor: "border-gray-300",
      reason: "content" as const,
      accent: "gray" as const,
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <HeroCarousel slides={heroSlides} className="border-2 shadow-[12px_12px_0_0_#000]" />

      {movieRows.map((row, index) => (
        <section
          key={index}
          className={`mt-10 rounded-2xl border-2 ${row.borderColor} ${row.bgColor} p-6 shadow-[8px_8px_0_0_#000]`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className={`text-2xl font-extrabold ${row.titleColor}`}>{row.title}</h2>
            {row.metta ? (
              <div className="inline-flex items-center rounded-md bg-green-200 border-2 border-green-600 text-green-900 px-3 py-1 font-extrabold shadow-[4px_4px_0_0_#000]">
                MeTTa powered
              </div>
            ) : null}
          </div>
          <ImprovedHorizontalScroll>
            {row.data.map((item) => {
              const movie = item.movie || item
              // Extract recommendation data if available
              const recommendationData = item.match_score ? {
                match_score: item.match_score,
                reason: item.reason,
                key_matches: item.key_matches,
                collaborative_insights: row.reason === "collaborative" ? item.collaborative_insights : undefined
              } : undefined
              
              return (
                <div key={movie.imdbID} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                  <MovieCard
                    movie={{
                      id: movie.imdbID,
                      title: movie.Title,
                      poster: movie.Poster,
                      genres: movie.Genre || [],
                      reason: row.reason,
                      year: Number((movie.Year || "").slice(0, 4)) || undefined,
                    }}
                    onFeedback={handleFeedback}
                    onAdd={handleAdd}
                    likedState={feedback[movie.imdbID]}
                    watched={history.includes(movie.imdbID)}
                    accent={row.accent}
                    recommendationData={recommendationData}
                  />
                </div>
              )
            })}
          </ImprovedHorizontalScroll>
        </section>
      ))}
    </main>
  )
}
