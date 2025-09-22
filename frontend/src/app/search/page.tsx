"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import SearchGridCard from "@/components/SearchGridCard";
import { movies as allMovies } from "@/lib/dummy";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skiper48 } from "@/components/Skiper48";
import Loading from "@/components/Loading";
import { resolveSearch, type MovieLite, type PageMeta } from "@/services/ngrok/search";

const allGenres = Array.from(
  new Set(allMovies.flatMap((m) => m.genres))
).sort();

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") ?? "";
  const initialPage = Math.max(1, Number(params.get("page") ?? 1));

  const [q, setQ] = useState(initialQ);
  const [genre, setGenre] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [view, setView] = useState<"grid" | "slider">("grid");

  const [actor, setActor] = useState<string>("");
  const [director, setDirector] = useState<string>("");
  const [page, setPage] = useState<number>(initialPage);
  const limit = 18;

  const [data, setData] = useState<{ items: MovieLite[]; pagination: PageMeta }>({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch results
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    resolveSearch({ q, genre, actor, director, page, limit })
      .then(setData)
      .catch(() => setData({ items: [], pagination: { total: 0, page: 1, pages: 1 } }))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [q, genre, actor, director, page]);

  // Keep q and page in URL
  useEffect(() => {
    const search = new URLSearchParams();
    if (q.trim()) search.set("q", q.trim());
    if (page > 1) search.set("page", String(page));
    router.replace(`/search${search.toString() ? `?${search.toString()}` : ""}`);
  }, [q, page, router]);

  // Client-side year filter
  const displayItems = useMemo(() => {
    if (year === "all") return data.items;
    return data.items.filter((m) => (m.Year ? m.Year.startsWith(year) : false));
  }, [data.items, year]);

  function toMovieCard(m: MovieLite) {
    return {
      id: m.imdbID,
      title: m.Title,
      poster: m.Poster,
      genres: m.Genre || [],
      reason: "content" as const,
      year: Number((m.Year || "").slice(0, 4)) || undefined,
    };
  }

  const years = useMemo(() => Array.from(new Set(allMovies.map((m) => m.year).filter(Boolean))).sort() as number[], []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Search</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">View:</span>
          <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}>Grid</Button>
          <Button variant={view === "slider" ? "default" : "outline"} size="sm" onClick={() => setView("slider")}>Slider</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border-2 bg-white p-4 shadow-[6px_6px_0_0_#000] dark:bg-black/30">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Query</label>
              <Input className="mt-1" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold">Actor</label>
              <Input className="mt-1" placeholder="e.g. Leonardo DiCaprio" value={actor} onChange={(e) => setActor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold">Director</label>
              <Input className="mt-1" placeholder="e.g. Christopher Nolan" value={director} onChange={(e) => setDirector(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {allGenres.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        <section>
          {loading ? (
            <div className="py-10"><Loading /></div>
          ) : view === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((m) => (
                <SearchGridCard key={m.imdbID} movie={m} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <Skiper48 images={displayItems.map((m) => ({ src: m.Poster, alt: m.Title }))} />
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-sm">Page {data.pagination.page} of {data.pagination.pages} • {data.pagination.total} results</div>
            <Button variant="outline" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}>Next</Button>
          </div>
        </section>
      </div>
    </main>
  );
}


