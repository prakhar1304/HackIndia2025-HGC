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
    console.log('🔍 useCollaborativeSearchCache effect triggered with userId:', userId)
    
    console.log("userId --> hook", userId);
    
    if (!userId) {
      console.log('❌ No userId provided, clearing recommendations')
      setRecommendations([])
      setIsFromCache(false)
      return
    }

    // Check if we have valid cached data
    const cachedData = getCachedRecommendations(userId)
    if (cachedData) {
      console.log('📦 Loading collaborative search recommendations from cache for user:', userId, 'Data length:', cachedData.length)
      setRecommendations(cachedData)
      setIsFromCache(true)
      return
    }

    // Fetch fresh data using MeTTa queue
    console.log('🌐 Fetching fresh collaborative search recommendations from API for user:', userId)
    setLoading(true)
    setIsFromCache(false)
    
    // Create queue-safe API call
    const queueSafeApiCall = createMettaApiCall(
      `collaborative-search-${userId}`,
      () => getCollaborativeSearchRecommendations(userId)
    )
    
    queueSafeApiCall()
      .then((items) => {
        console.log('✅ API response received for user:', userId, 'Items length:', items?.length || 0)
        console.log('📊 API response data:', items)
        
        if (Array.isArray(items)) {
          setRecommendations(items)
          // Cache the fresh data (even if empty to prevent repeated API calls)
          cacheRecommendations(userId, items)
          console.log('💾 Successfully cached collaborative search recommendations for user:', userId, 'with', items.length, 'items')
        } else {
          console.warn('⚠️ API returned invalid data (not an array) for user:', userId)
          const emptyArray: CollaborativeRecommendation[] = []
          setRecommendations(emptyArray)
          cacheRecommendations(userId, emptyArray)
        }
      })
      .catch((error) => {
        console.error('❌ Failed to fetch collaborative search recommendations for user:', userId, error)
        setRecommendations([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  // Debug function to inspect cache state
  const debugCache = () => {
    console.log('🔍 Cache Debug Info:')
    console.log('- Cache Key:', CACHE_KEY)
    console.log('- Expiry Key:', CACHE_EXPIRY_KEY)
    console.log('- Current User ID:', userId)
    console.log('- Current Recommendations:', recommendations)
    console.log('- Loading:', loading)
    console.log('- Is From Cache:', isFromCache)
    
    const cached = localStorage.getItem(CACHE_KEY)
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    console.log('- Cached Data:', cached ? JSON.parse(cached) : null)
    console.log('- Expiry Time:', expiry ? new Date(parseInt(expiry)) : null)
  }

  // Function to force refresh data
  const forceRefresh = () => {
    console.log('🔄 Force refreshing collaborative search data for user:', userId)
    clearCollaborativeSearchCache()
    if (userId) {
      setLoading(true)
      setIsFromCache(false)
      
      const queueSafeApiCall = createMettaApiCall(
        `collaborative-search-${userId}`,
        () => getCollaborativeSearchRecommendations(userId)
      )
      
      queueSafeApiCall()
        .then((items) => {
          console.log('✅ Force refresh API response for user:', userId, 'Items length:', items?.length || 0)
          if (Array.isArray(items)) {
            setRecommendations(items)
            cacheRecommendations(userId, items)
            console.log('💾 Force refresh cached data for user:', userId, 'with', items.length, 'items')
          } else {
            console.warn('⚠️ Force refresh returned invalid data for user:', userId)
            const emptyArray: CollaborativeRecommendation[] = []
            setRecommendations(emptyArray)
            cacheRecommendations(userId, emptyArray)
          }
        })
        .catch((error) => {
          console.error('❌ Force refresh failed for user:', userId, error)
          setRecommendations([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return {
    recommendations,
    loading,
    isFromCache,
    clearCache: () => clearCollaborativeSearchCache(),
    debugCache,
    forceRefresh
  }
}

function getCachedRecommendations(userId: string): CollaborativeRecommendation[] | null {
  try {
    console.log('🔍 Checking cache for user:', userId)
    const cached = localStorage.getItem(CACHE_KEY)
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    
    console.log('📋 Cache keys found:', { cached: !!cached, expiry: !!expiry })
    
    if (!cached || !expiry) {
      console.log('❌ No cache data or expiry found')
      return null
    }
    
    const cacheData: CacheData = JSON.parse(cached)
    const expiryTime = parseInt(expiry)
    const now = Date.now()
    
    console.log('📊 Cache data:', {
      cachedUserId: cacheData.userId,
      requestedUserId: userId,
      cacheTimestamp: cacheData.timestamp,
      expiryTime,
      currentTime: now,
      isExpired: now > expiryTime,
      userMatch: cacheData.userId === userId
    })
    
    // Check if cache is expired or for different user
    if (now > expiryTime) {
      console.log('⏰ Cache expired, clearing cache')
      clearCollaborativeSearchCache()
      return null
    }
    
    if (cacheData.userId !== userId) {
      console.log('👤 Cache is for different user, clearing cache')
      clearCollaborativeSearchCache()
      return null
    }
    
    console.log('✅ Cache hit! Returning cached data with', cacheData.data.length, 'items')
    
    // If cached data is empty, don't use it - fetch fresh data instead
    if (cacheData.data.length === 0) {
      console.log('⚠️ Cached data is empty, clearing cache to fetch fresh data')
      clearCollaborativeSearchCache()
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.error('❌ Error reading collaborative search cache:', error)
    clearCollaborativeSearchCache()
    return null
  }
}

function cacheRecommendations(userId: string, data: CollaborativeRecommendation[]) {
  try {
    console.log('💾 Attempting to cache data for user:', userId, 'Data length:', data.length)
    
    const cacheData: CacheData = {
      userId,
      data,
      timestamp: Date.now()
    }
    
    const expiryTime = Date.now() + CACHE_DURATION
    
    console.log('📊 Cache data to store:', {
      userId: cacheData.userId,
      dataLength: cacheData.data.length,
      timestamp: cacheData.timestamp,
      expiryTime
    })
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    
    // Verify the cache was stored correctly
    const verifyCached = localStorage.getItem(CACHE_KEY)
    const verifyExpiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    
    if (verifyCached && verifyExpiry) {
      console.log('✅ Successfully cached collaborative search recommendations for user:', userId)
    } else {
      console.error('❌ Failed to verify cache storage for user:', userId)
    }
  } catch (error) {
    console.error('❌ Error caching collaborative search recommendations for user:', userId, error)
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
