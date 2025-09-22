import { api } from "@/lib/api";

export const getTopRated = async (limit = 5) => {
  const { data } = await api.get(`/api/movies/top-rated`, { params: { limit } });
  return (data?.data || []) as Array<{ imdbID: string; Title: string; Poster: string; Genre?: string[]; Year?: string }>;
};

export const getByGenre = async (genre: string, limit = 10) => {
  const { data } = await api.get(`/api/movies/genre/${encodeURIComponent(genre)}`, { params: { limit } });
  return (data?.data || []) as Array<{ imdbID: string; Title: string; Poster: string; Genre?: string[]; Year?: string }>;
};


