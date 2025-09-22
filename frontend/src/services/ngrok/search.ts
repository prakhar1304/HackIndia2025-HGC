import { api } from "@/lib/api";

export type MovieLite = {
  imdbID: string;
  Title: string;
  Poster: string;
  Genre?: string[];
  Year?: string;
};

export type PageMeta = { total: number; page: number; pages: number };

export type PagedResult<T> = {
  items: T[];
  pagination: PageMeta;
};

function unpack<T>(data: any): PagedResult<T> {
  return {
    items: (data?.data ?? []) as T[],
    pagination: data?.pagination ?? { total: 0, page: 1, pages: 1 },
  };
}

export async function searchMovies(query: string, type?: "genre"|"actor"|"director", page=1, limit=18) {
  const { data } = await api.get(`/api/movies/search`, { params: { query, type, page, limit }});
  return unpack<MovieLite>(data);
}

export async function getByGenre(genre: string, page=1, limit=18) {
  const { data } = await api.get(`/api/movies/genre/${encodeURIComponent(genre)}`, { params: { page, limit } });
  return unpack<MovieLite>(data);
}

export async function getByActor(actor: string, page=1, limit=18) {
  const { data } = await api.get(`/api/movies/actor/${encodeURIComponent(actor)}`, { params: { page, limit } });
  return unpack<MovieLite>(data);
}

export async function getByDirector(director: string, page=1, limit=18) {
  const { data } = await api.get(`/api/movies/director/${encodeURIComponent(director)}`, { params: { page, limit } });
  return unpack<MovieLite>(data);
}

export async function getById(imdbId: string) {
  const { data } = await api.get(`/api/movies/${encodeURIComponent(imdbId)}`);
  return (data?.data ?? null) as MovieLite | null;
}

export async function resolveSearch({
  q,
  genre,
  actor,
  director,
  page = 1,
  limit = 18,
}: {
  q?: string; genre?: string; actor?: string; director?: string; page?: number; limit?: number;
}): Promise<PagedResult<MovieLite>> {
  if (genre && genre !== "all") return getByGenre(genre, page, limit);
  if (actor) return getByActor(actor, page, limit);
  if (director) return getByDirector(director, page, limit);
  if (q?.trim()) return searchMovies(q.trim(), undefined, page, limit);
  return { items: [], pagination: { total: 0, page: 1, pages: 1 } };
}


