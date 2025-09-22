import { api } from "@/lib/api";

export type CompareResponse = {
  titles: { movie1: string; movie2: string };
  commonalities: {
    genres: string[];
    directors: string[];
    actors: string[];
    writers: string[];
    languages: string[];
    countries: string[];
  };
  differences: {
    uniqueGenres: { movie1: string[]; movie2: string[] };
    uniqueDirectors: { movie1: string[]; movie2: string[] };
    uniqueActors: { movie1: string[]; movie2: string[] };
    yearDifference?: number;
    ratingDifference?: number;
  };
  naturalLanguageExplanation?: string;
};

export async function compareMovies(left: string, right: string) {
  const { data } = await api.get(`/api/explain/compare/${encodeURIComponent(left)}/${encodeURIComponent(right)}`);
  return (data?.data ?? null) as CompareResponse | null;
}

export async function getNarrativeExplanation(left: string, right: string, factor: string = "genre") {
  const { data } = await api.get(`/api/explain/narrative/${encodeURIComponent(left)}/${encodeURIComponent(right)}`, { params: { factor } });
  return (data?.data?.narrative ?? "") as string;
}

// Optional: keep decide stub if needed later
export async function decideForUser(userId: string, left: string, right: string) {
  const { data } = await api.get(`/api/recommendations/decide`, { params: { userId, left, right } });
  return data?.data;
}


