import { localApi } from "@/lib/local";

export type LocalRecommendation = {
  match_score: number;
  reason?: {
    title: string;
    summary: string;
    points: string[];
  };
  key_matches?: string[];
  movie: {
    imdbID: string;
    Title: string;
    Poster: string;
    Genre?: string[];
    Year?: string;
  };
};

export type CollaborativeRecommendation = {
  match_score: number;
  collaborative_insights: {
    common_patterns: string[];
    discovery_insight: string;
    recommending_users: string[];
  };
  key_matches: string[];
  reason: {
    title: string;
    summary: string;
    points: string[];
  };
  movie: {
    imdbID: string;
    Title: string;
    Poster: string;
    Genre?: string[];
    Year?: string;
    Actors?: string[];
    Director?: string[];
    Country?: string[];
    Language?: string[];
    imdbRating?: number;
    imdbVotes?: number;
  };
};

export const getCollabRecommendations = async (userId: string) => {
  const { data } = await localApi.get(`/recommendations/content/bob`);
//   const { data } = await localApi.get(`/recommendations/content/${encodeURIComponent(userId)}`);
  return (data?.recommendations || []) as LocalRecommendation[];
};

export const getCollaborativeSearchRecommendations = async (userId: string) => {
  console.log('🌐 Fetching collaborative search recommendations for user:', userId);
  try {
    // const { data } = await localApi.get(`/recommendations/collaborative-search/${encodeURIComponent(userId)}`);
    const { data } = await localApi.get(`/recommendations/collaborative-search/pinky`);
    console.log('📊 Collaborative search API response:', data);
    
    if (!data || !data.ok) {
      console.warn('⚠️ Collaborative search API returned error:', data?.error || 'Unknown error');
      return [];
    }
    
    const recommendations = data?.recommendations || [];
    console.log('✅ Collaborative search recommendations extracted:', recommendations.length, 'items');
    return recommendations as CollaborativeRecommendation[];
  } catch (error) {
    console.error('❌ Collaborative search API call failed:', error);
    throw error;
  }
};


