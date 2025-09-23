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
  const { data } = await localApi.get(`/recommendations/collaborative-search/${encodeURIComponent(userId)}`);
  return (data?.recommendations || []) as CollaborativeRecommendation[];
};


