import { api } from "@/lib/api";

export type NgrokRecommendation = {
  movie: {
    imdbID: string;
    Title: string;
    Poster: string;
    Genre?: string[];
    Year?: string;
  };
  score?: number;
  reasoning?: string;
};

export const recommendBySeedMovie = async (imdbId: string, userId?: string) => {
  const path = `/api/recommendations/movie/${imdbId}` + (userId ? `?userId=${encodeURIComponent(userId)}` : "");
  const { data } = await api.get(path);
  return (data?.data || []) as NgrokRecommendation[];
};

export const recommendForUser = async (userId: string) => {
  const { data } = await api.get(`/api/recommendations/user/${encodeURIComponent(userId)}`);
  return (data?.data || []) as NgrokRecommendation[];
};


