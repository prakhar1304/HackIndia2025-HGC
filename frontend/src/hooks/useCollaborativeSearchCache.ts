import { useState, useEffect } from 'react'
import { getCollaborativeSearchRecommendations, type CollaborativeRecommendation } from '@/services/local/recommendations'
import { createMettaApiCall } from '@/services/mettaQueue'

const CACHE_KEY = 'collaborative_search_cache'
const CACHE_EXPIRY_KEY = 'collaborative_search_expiry'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

interface CacheData {
  userId: string
  data: CollaborativeRecommendation[]
  timestamp: number
}

export function useCollaborativeSearchCache(userId: string | null) {
  const [recommendations, setRecommendations] = useState<CollaborativeRecommendation[]>([])
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
      console.log('📦 Loading collaborative search recommendations from cache')
      setRecommendations(cachedData)
      setIsFromCache(true)
      return
    }

    // Fetch fresh data using MeTTa queue
    console.log('🌐 Fetching fresh collaborative search recommendations from API')
    setLoading(true)
    setIsFromCache(false)
    
    // Create queue-safe API call
    const queueSafeApiCall = createMettaApiCall(
      `collaborative-search-${userId}`,
      () => getCollaborativeSearchRecommendations(userId)
    )
    
    queueSafeApiCall()
      .then((items) => {
        setRecommendations(items)
        // Cache the fresh data
        cacheRecommendations(userId, items)
      })
      .catch((error) => {
        console.error('Failed to fetch collaborative search recommendations:', error)
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
    clearCache: () => clearCollaborativeSearchCache()
  }
}

function getCachedRecommendations(userId: string): CollaborativeRecommendation[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    
    if (!cached || !expiry) return null
    
    const cacheData: CacheData = JSON.parse(cached)
    const expiryTime = parseInt(expiry)
    
    // Check if cache is expired or for different user
    if (Date.now() > expiryTime || cacheData.userId !== userId) {
      clearCollaborativeSearchCache()
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.error('Error reading collaborative search cache:', error)
    clearCollaborativeSearchCache()
    return null
  }
}

function cacheRecommendations(userId: string, data: CollaborativeRecommendation[]) {
  try {
    const cacheData: CacheData = {
      userId,
      data,
      timestamp: Date.now()
    }
    
    const expiryTime = Date.now() + CACHE_DURATION
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    
    console.log('💾 Cached collaborative search recommendations for user:', userId)
  } catch (error) {
    console.error('Error caching collaborative search recommendations:', error)
  }
}

function clearCollaborativeSearchCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
    console.log('🗑️ Cleared collaborative search recommendations cache')
  } catch (error) {
    console.error('Error clearing collaborative search cache:', error)
  }
}
