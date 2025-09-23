import { useState, useEffect } from 'react'
import { getByCountryLocal, type LocalMovie } from '@/services/local/movies'
import { createMettaApiCall } from '@/services/mettaQueue'

const CACHE_KEY = 'india_movies_cache'
const CACHE_EXPIRY_KEY = 'india_movies_expiry'
const CACHE_DURATION = 1 * 60 * 1000 // 30 minutes in milliseconds

interface CacheData {
  data: LocalMovie[]
  timestamp: number
}

export function useIndiaMoviesCache() {
  const [movies, setMovies] = useState<LocalMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)

  useEffect(() => {
    // Check if we have valid cached data
    const cachedData = getCachedMovies()
    if (cachedData) {
      console.log('📦 Loading India movies from cache')
      setMovies(cachedData)
      setIsFromCache(true)
      return
    }

    // Fetch fresh data using MeTTa queue
    console.log('🌐 Fetching fresh India movies from API')
    setLoading(true)
    setIsFromCache(false)
    
    // Create queue-safe API call
    const queueSafeApiCall = createMettaApiCall(
      'india-movies',
      () => getByCountryLocal()
    )
    
    queueSafeApiCall()
      .then((items) => {
        setMovies(items)
        // Cache the fresh data
        cacheMovies(items)
      })
      .catch((error) => {
        console.error('Failed to fetch India movies:', error)
        setMovies([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return {
    movies,
    loading,
    isFromCache,
    clearCache: () => clearIndiaMoviesCache()
  }
}

function getCachedMovies(): LocalMovie[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    
    if (!cached || !expiry) return null
    
    const cacheData: CacheData = JSON.parse(cached)
    const expiryTime = parseInt(expiry)
    
    // Check if cache is expired
    if (Date.now() > expiryTime) {
      clearIndiaMoviesCache()
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.error('Error reading India movies cache:', error)
    clearIndiaMoviesCache()
    return null
  }
}

function cacheMovies(data: LocalMovie[]) {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    }
    
    const expiryTime = Date.now() + CACHE_DURATION
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    
    console.log('💾 Cached India movies')
  } catch (error) {
    console.error('Error caching India movies:', error)
  }
}

function clearIndiaMoviesCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
    console.log('🗑️ Cleared India movies cache')
  } catch (error) {
    console.error('Error clearing India movies cache:', error)
  }
}
