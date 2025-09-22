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

export const getCollabRecommendations = async (userId: string) => {
  const { data } = await localApi.get(`/recommendations/content/bob`);
//   const { data } = await localApi.get(`/recommendations/content/${encodeURIComponent(userId)}`);
  return (data?.recommendations || []) as LocalRecommendation[];
};


