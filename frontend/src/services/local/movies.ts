import { localApi } from "@/lib/local";

export type LocalMovie = {
  imdbID: string;
  Title: string;
  Poster: string;
  Genre?: string[];
};

export const getRandomMovies = async () => {
  const { data } = await localApi.get(`/movies/random`);
  return data as { count: number; items: LocalMovie[] };
};

export const getByCountryLocal = async () => {
  const { data } = await localApi.get(`/movies/by-country`);
  return (data?.items || []) as LocalMovie[];
};


