import { useState, useEffect } from 'react'
import { getCollabRecommendations, type LocalRecommendation } from '@/services/local/recommendations'

const CACHE_KEY = 'collab_recommendations_cache'
const CACHE_EXPIRY_KEY = 'collab_recommendations_expiry'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CacheData {
  userId: string
  data: LocalRecommendation[]
  timestamp: number
}

export function useRecommendationsCache(userId: string | null) {
  const [recommendations, setRecommendations] = useState<LocalRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [isFromCache, setIsFromCache] = useState(false)

  useEffect(() => {
    if (!userId) {
      setRecommendations([])
      setIsFromCache(false)
      return
    }

    // Check if we have valid cached data
    const cachedData = getCachedRecommendations(userId)
    if (cachedData) {
      console.log('📦 Loading recommendations from cache')
      setRecommendations(cachedData)
      setIsFromCache(true)
      return
    }

    // Fetch fresh data
    console.log('🌐 Fetching fresh recommendations from API')
    setLoading(true)
    setIsFromCache(false)
    
    getCollabRecommendations(userId)
      .then((items) => {
        setRecommendations(items)
        // Cache the fresh data
        cacheRecommendations(userId, items)
      })
      .catch((error) => {
        console.error('Failed to fetch recommendations:', error)
        setRecommendations([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  return {
    recommendations,
    loading,
    isFromCache,
    clearCache: () => clearRecommendationsCache()
  }
}

function getCachedRecommendations(userId: string): LocalRecommendation[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    
    if (!cached || !expiry) return null
    
    const cacheData: CacheData = JSON.parse(cached)
    const expiryTime = parseInt(expiry)
    
    // Check if cache is expired or for different user
    if (Date.now() > expiryTime || cacheData.userId !== userId) {
      clearRecommendationsCache()
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.error('Error reading cache:', error)
    clearRecommendationsCache()
    return null
  }
}

function cacheRecommendations(userId: string, data: LocalRecommendation[]) {
  try {
    const cacheData: CacheData = {
      userId,
      data,
      timestamp: Date.now()
    }
    
    const expiryTime = Date.now() + CACHE_DURATION
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    
    console.log('💾 Cached recommendations for user:', userId)
  } catch (error) {
    console.error('Error caching recommendations:', error)
  }
}

function clearRecommendationsCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
    console.log('🗑️ Cleared recommendations cache')
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}
