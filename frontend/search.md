# Search and Compare Implementation (2 Batches)

This guide explains how to implement movie Search (with filters, pagination, and slider view) and a floating Compare Tray widget. It uses your ngrok backend APIs and existing UI components (`MovieCard`, `Skiper48`, Tailwind + shadcn).

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (defaults to ngrok in `src/lib/api.ts`)
- Global header `ngrok-skip-browser-warning: true` is already handled.

## Endpoints (server returns paginated lists)
- GET `/api/movies/search?query=action&type=genre&page=1&limit=20`
- GET `/api/movies/genre/Action?page=1&limit=20`
- GET `/api/movies/director/Christopher%20Nolan?page=1&limit=20`
- GET `/api/movies/actor/Leonardo%20DiCaprio?page=1&limit=20`
- GET `/api/movies/tt0250223` (fetch by IMDB ID)

Expected response shape:
```json
{
  "success": true,
  "data": [ { "imdbID": "tt13131232", "Title": "Mission Majnu", "Poster": "...", "Genre": ["Action","Drama"], "Year": "2023" } ],
  "pagination": { "total": 292, "page": 1, "pages": 30 }
}
```

Data mapping for UI (`MovieCard`):
- id ← `imdbID`
- title ← `Title`
- poster ← `Poster`
- genres ← `Genre` (string[])
- year ← `Number(Year?.slice(0,4))`

---

## Batch 1 — Search + Filters + Pagination + Slider

### 1) Create ngrok search service
`src/services/ngrok/search.ts`
```ts
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

function map(data: any[]): MovieLite[] {
  return (data ?? []) as MovieLite[];
}

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

// One resolver the UI can call
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
```

### 2) Upgrade the Search page
`src/app/search/page.tsx`
- Keep sidebar filters.
- Add `actor`, `director`, `page`, `limit` states.
- Read `q` and `page` from URL; push updates to URL on change.
- Fetch via `resolveSearch`.
- Map items to `MovieCard` props.
- Add pagination controls.
- Slider view already uses `Skiper48`.

Key snippet to adapt:
```tsx
// new state
const [actor, setActor] = useState<string>("");
const [director, setDirector] = useState<string>("");
const [page, setPage] = useState<number>(Number(params.get("page") ?? 1));
const limit = 18;

const [data, setData] = useState<{ items: MovieLite[]; pagination: PageMeta }>({ items: [], pagination: { total: 0, page: 1, pages: 1 }});
const [loading, setLoading] = useState(false);

useEffect(() => {
  const controller = new AbortController();
  setLoading(true);
  resolveSearch({ q, genre, actor, director, page, limit })
    .then(setData)
    .catch(() => setData({ items: [], pagination: { total: 0, page: 1, pages: 1 }}))
    .finally(() => setLoading(false));
  return () => controller.abort();
}, [q, genre, actor, director, page]);

function toMovieCard(m: MovieLite) {
  return {
    id: m.imdbID,
    title: m.Title,
    poster: m.Poster,
    genres: m.Genre || [],
    reason: "content" as const,
    year: Number((m.Year || "").slice(0,4)) || undefined,
  };
}
```

Pagination UI (simple prev/next + page x of y):
```tsx
<div className="mt-6 flex items-center justify-between">
  <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
  <div className="text-sm">Page {data.pagination.page} of {data.pagination.pages} • {data.pagination.total} results</div>
  <Button variant="outline" disabled={page >= data.pagination.pages} onClick={() => setPage(p => Math.min(data.pagination.pages, p+1))}>Next</Button>
</div>
```

Notes
- Preserve the View toggle. For slider: `images={data.items.map(m => ({ src: m.Poster, alt: m.Title }))}`.
- Keep query in URL: `router.push(/search?q=...&page=...)`.
- `MovieCard` already handles invalid images via `/home/noimage.svg`.

Deliverable for Batch 1
- `src/services/ngrok/search.ts` created.
- `src/app/search/page.tsx` wired to service with filters, pagination, view toggle.
- No Compare UI yet.

---

## Batch 2 — Floating Compare Tray (pick 2, compare, decide)

UX
- “Add to Compare” on each card (opens tray after first pick).
- Tray (bottom-right floating) shows up to 2 movies with posters/titles.
- Actions:
  - Compare: show side-by-side quick facts (Year, Genres, Rating if available).
  - Decide for me: calls a decide API (by user history) and highlights the pick.
  - CTA: Like / Add to History using existing services.

### 1) Compare state (global)
`src/context/CompareContext.tsx`
```ts
"use client";
import { createContext, useContext, useMemo, useState } from "react";

export type Pick = { imdbID: string; Title: string; Poster: string; Genre?: string[]; Year?: string };

type Ctx = {
  open: boolean;
  picks: Pick[];
  add(p: Pick): void;
  remove(id: string): void;
  clear(): void;
  setOpen(v: boolean): void;
};

const CompareCtx = createContext<Ctx | null>(null);
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const api: Ctx = useMemo(() => ({
    open, picks, setOpen,
    add(p) { setPicks(prev => prev.find(x => x.imdbID===p.imdbID) ? prev : (prev.length>=2 ? [prev[0], p] : [...prev, p])); setOpen(true); },
    remove(id) { setPicks(prev => prev.filter(x => x.imdbID !== id)); },
    clear() { setPicks([]); },
  }), [open, picks]);
  return <CompareCtx.Provider value={api}>{children}</CompareCtx.Provider>;
}
export const useCompare = () => {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("CompareProvider missing");
  return ctx;
};
```

Wrap app
- In `src/app/layout.tsx` wrap children with `CompareProvider` (outside pages, similar to `LocalAuthProvider`).

### 2) Floating tray UI
`src/components/CompareTray.tsx`
```tsx
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/CompareContext";

export function CompareTray({ onCompare, onDecide }: { onCompare: (ids: string[]) => void; onDecide: (ids: string[]) => void; }) {
  const { open, setOpen, picks, remove, clear } = useCompare();
  if (!open) return null;
  const ids = picks.map(p => p.imdbID);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] rounded-xl border-2 bg-white p-3 shadow-[8px_8px_0_0_#000]">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-extrabold">Compare Tray</div>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Hide</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {picks.map(p => (
          <div key={p.imdbID} className="rounded-lg border p-2">
            <div className="relative h-24 w-full">
              <Image src={p.Poster || "/home/noimage.svg"} alt={p.Title} fill className="object-cover" />
            </div>
            <div className="mt-1 line-clamp-2 text-xs font-semibold">{p.Title}</div>
            <Button size="xs" variant="outline" className="mt-1 w-full" onClick={() => remove(p.imdbID)}>Remove</Button>
          </div>
        ))}
        {picks.length < 2 && <div className="grid place-items-center rounded-lg border text-xs text-muted-foreground">Add another</div>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => clear()}>Clear</Button>
        <div className="space-x-2">
          <Button size="sm" disabled={ids.length !== 2} onClick={() => onCompare(ids)}>Compare</Button>
          <Button size="sm" disabled={ids.length !== 2} onClick={() => onDecide(ids)}>Decide for me</Button>
        </div>
      </div>
    </div>
  );
}
```

Mount tray globally
- Add `<CompareTray onCompare={...} onDecide={...} />` once in `layout.tsx` (after `Header`), so it works across pages.

### 3) Wire buttons on cards
- Add a “Compare” action to each `MovieCard` render in search results:
  - From `MovieLite` map to `{ imdbID, Title, Poster, Genre, Year }` and call `useCompare().add(...)`.
  - Easiest: wrap `MovieCard` with a small absolute “Compare” button (no need to edit the component):
    ```tsx
    <div className="relative">
      <MovieCard movie={toMovieCard(m)} />
      <Button size="xs" className="absolute right-2 top-2" onClick={() => add({ imdbID: m.imdbID, Title: m.Title, Poster: m.Poster, Genre: m.Genre, Year: m.Year })}>
        Compare
      </Button>
    </div>
    ```

### 4) APIs for compare/decide
`src/services/ngrok/compare.ts` (adjust paths to your backend)
```ts
import { api } from "@/lib/api";

export async function compareMovies(left: string, right: string) {
  // TODO: replace path with your actual compare endpoint
  const { data } = await api.get(`/api/movies/compare`, { params: { left, right } });
  return data?.data;
}

export async function decideForUser(userId: string, left: string, right: string) {
  // TODO: replace path with your actual decide endpoint
  const { data } = await api.get(`/api/recommendations/decide`, { params: { userId, left, right } });
  return data?.data; // e.g. { pick: "tt..." , reason: "..." }
}
```

Use in `CompareTray` handlers:
- On Compare: call `compareMovies(ids[0], ids[1])`, show quick facts in a small inline panel (optional).
- On Decide: read `ngrokUserId` from `localStorage` and call `decideForUser`; highlight chosen card and show “Like” / “Add to History” CTAs (use existing `likeNgrok` and `addToHistoryNgrok`).

---

## Tips and QA

- Image domains: `m.media-amazon.com` already allowed in `next.config.ts`.
- Invalid posters are handled by `MovieCard` fallback `/home/noimage.svg`.
- Keep query + page in URL for shareability.
- Debounce optional (300ms) if you want live-search; otherwise fetch on submit/change.
- Cancel stale requests via AbortController (shown in effect cleanup).
- Empty state: when no inputs, show nothing (or popular genres chips).

## Deliverables Checklist

Batch 1
- [ ] `src/services/ngrok/search.ts` created.
- [ ] `src/app/search/page.tsx` wired to service with actor/director/genre filters.
- [ ] Pagination (Prev/Next) working; Grid/Slider view toggle intact.

Batch 2
- [ ] `src/context/CompareContext.tsx` and provider wrapped in `layout.tsx`.
- [ ] `src/components/CompareTray.tsx` mounted globally.
- [ ] “Compare” button on search results cards.
- [ ] `src/services/ngrok/compare.ts` stubs created and wired to buttons.
- [ ] Decide action uses `ngrokUserId` and existing Like/History services.