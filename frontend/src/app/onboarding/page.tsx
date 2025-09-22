"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getRandomMovies } from "@/services/local/movies";
import { type LocalUserPayload } from "@/services/local/users";
import { useLocalAuth } from "@/context/LocalAuthContext";
import Loading from "@/components/Loading";
import { createNgrokUser } from "@/services/ngrok/users";

const GENRES = ["Action","Adventure","Comedy","Drama","Family","Fantasy","Sci-Fi","Thriller"];
const LANGS = ["English","Hindi","Japanese","French","Spanish"];
const COUNTRIES = ["United States","India","France","United Kingdom","Japan"];

export default function OnboardingPage() {
  const { userId, start } = useLocalAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [favGenres, setFavGenres] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [pool, setPool] = useState<{ Title:string; Poster:string; imdbID:string }[]>([]);
  const progress = (step / 3) * 100;

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getRandomMovies()
      .then((d) => setPool(d.items.slice(0,10)))
      .finally(()=>setLoading(false));
  }, []);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const payload: LocalUserPayload = {
      userId: username || "guest",
      countries,
      languages,
      watched: [],
      liked,
      fav_genres: favGenres,
      fav_actors: [],
      fav_directors: [],
      writers: [],
    };
    setSubmitting(true);
    try {
      await start(payload.userId, {
        countries: payload.countries,
        languages: payload.languages,
        watched: payload.watched,
        liked: payload.liked,
        fav_genres: payload.fav_genres,
        fav_actors: payload.fav_actors,
        fav_directors: payload.fav_directors,
        writers: payload.writers,
      });
      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 h-3 w-full rounded-full border-2 bg-purple-100 shadow-[4px_4px_0_0_#000]">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${progress}%` }} />
      </div>

      {step === 1 && (
        <section className="rounded-2xl border-2 bg-white p-6 shadow-[10px_10px_0_0_#000]">
          <h1 className="text-2xl font-extrabold">Create your profile</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Username</label>
              <Input className="mt-1" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="e.g. pinky" />
            </div>
            <div>
              <label className="text-sm font-semibold">Countries</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COUNTRIES.map((c)=>(
                  <button key={c} onClick={()=>toggle(countries,c,setCountries)} className={`rounded-md border-2 px-3 py-1 shadow-[3px_3px_0_0_#000] ${countries.includes(c)?"bg-purple-600 text-white":"bg-white"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Languages</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGS.map((l)=>(
                  <button key={l} onClick={()=>toggle(languages,l,setLanguages)} className={`rounded-md border-2 px-3 py-1 shadow-[3px_3px_0_0_#000] ${languages.includes(l)?"bg-purple-600 text-white":"bg-white"}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={()=>setStep(2)}>Next</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-2xl border-2 bg-white p-6 shadow-[10px_10px_0_0_#000]">
          <h2 className="text-xl font-extrabold">Pick favorite genres</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((g)=>(
              <button key={g} onClick={()=>toggle(favGenres,g,setFavGenres)} className={`rounded-md border-2 px-3 py-1 shadow-[3px_3px_0_0_#000] ${favGenres.includes(g)?"bg-purple-600 text-white":"bg-white"}`}>{g}</button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
            <Button onClick={async ()=>{
              if (username.trim()) {
                try {
                  const ng = await createNgrokUser(username.trim());
                  if (ng?._id) {
                    localStorage.setItem("ngrokUserId", ng._id);
                    localStorage.setItem("ngrokUsername", ng.username);
                  }
                } catch {}
              }
              setStep(3);
            }}>Next</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-2xl border-2 bg-white p-6 shadow-[10px_10px_0_0_#000]">
          <h2 className="text-xl font-extrabold">Select your favorite movies</h2>
          {loading ? (
            <Loading label="Fetching movies..." className="mt-4" />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {pool.map((m)=>(
                <button key={m.imdbID} onClick={()=>toggle(liked,`m_${m.imdbID}`,setLiked)} className={`text-left rounded-xl border-2 p-3 shadow-[6px_6px_0_0_#000] ${liked.includes(`m_${m.imdbID}`)?"bg-purple-100":"bg-white"}`}>
                  <div className="font-semibold">{m.Title}</div>
                  {Array.isArray((m as any).Genre) && (
                    <div className="mt-1 text-xs text-muted-foreground">{(m as any).Genre.join(", ")}</div>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={()=>setStep(2)} disabled={submitting}>Back</Button>
            <Button onClick={submit} disabled={submitting} className={submitting?"opacity-80":undefined}>
              {submitting ? "Finishing…" : "Finish"}
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}


