"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/CompareContext";
import { compareMovies, decideForUser, getNarrativeExplanation, type CompareResponse } from "@/services/ngrok/compare";
import { useState } from "react";

function tryParseJsonLoose(input: string): any | null {
  try {
    return JSON.parse(input);
  } catch {}
  const start = input.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = input.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {}
        break;
      }
    }
  }
  return null;
}

export function CompareTray() {
  const { open, setOpen, picks, remove, clear } = useCompare();
  const [explanation, setExplanation] = useState<string>("");
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const ids = picks.map((p) => p.imdbID);
  const canAct = ids.length === 2;
  if (!open) return null;

  async function handleSmartCompare() {
    try {
      if (!canAct || loading) return;
      setLoading(true);
      setAiResult(null);
      const data = await compareMovies(ids[0], ids[1]);
      setCompareData(data);
      const narrative = await getNarrativeExplanation(ids[0], ids[1], "genre");
      setExplanation(narrative);
      const resp = await fetch("/api/gemini", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ids: [ids[0], ids[1]],
          titles: data?.titles || {},
          compareData: data,
          narrative,
        }),
      });
      const text = await resp.text();
      let ai: any | null = null;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.result) ai = parsed.result;
        else if (parsed?.raw && typeof parsed.raw === "string") ai = tryParseJsonLoose(parsed.raw);
      } catch {
        ai = tryParseJsonLoose(text);
      }
      setAiResult(ai);
      if (ai) {
        await handleDecide();
      }
    } catch {
      setAiResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecide() {
    try {
      if (!canAct) return;
      const userId = typeof window !== "undefined" ? localStorage.getItem("ngrokUserId") || "" : "";
      if (!userId) return;
      await decideForUser(userId, ids[0], ids[1]);
      // Optional: show decision result in UI
    } catch {}
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] rounded-xl border-2 bg-white p-3 shadow-[8px_8px_0_0_#000]  bg-gradient-to-br from-purple-50 to-purple-100">
         {/* <img
          src="/home/lgrad.png"
          alt=""
          className="pointer-events-none absolute -top-21 -left-28 h-56 w-[100rem] scale-100 select-none"
        /> */}
      <div className="mb-2 flex items-center justify-between">
        <div className="font-extrabold">Compare Tray</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => clear()}>Clear</Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {picks.map((p) => (
          <div key={p.imdbID} className="rounded-lg border p-2">
            <div className="relative h-24 w-full">
              <Image src={p.Poster || "/home/noimage.svg"} alt={p.Title} fill className="object-cover" />
            </div>
            <div className="mt-1 line-clamp-2 text-xs font-semibold">{p.Title}</div>
            <Button size="sm" variant="outline" className="mt-1 w-full" onClick={() => remove(p.imdbID)}>Remove</Button>
          </div>
        ))}
        {picks.length < 2 && <div className="grid place-items-center rounded-lg border text-xs text-muted-foreground">Add another</div>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Pick two movies to compare</div>
        <div className="space-x-2">
          <Button size="sm" disabled={!canAct || loading} onClick={handleSmartCompare}>{loading ? "Analyzing..." : "Smart Compare"}</Button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="mt-3 rounded-md border p-2 text-xs">Analyzing</div>
      )}
      {aiResult && (
        <div className="mt-3 rounded-xl border-2 border-yellow-700 bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 text-xs shadow-[6px_6px_0_0_#000]">
          <div className="text-sm font-extrabold text-yellow-900">Comparison</div>
          <div className="mt-1 text-sm text-yellow-900">{aiResult.overview}</div>
          {Array.isArray(aiResult.headToHead) && aiResult.headToHead.length ? (
            <div className="mt-2">
              <div className="font-bold text-yellow-900">Head to Head</div>
              <ul className="mt-1 list-disc pl-4">
                {aiResult.headToHead.map((h: any, i: number) => (
                  <li key={i}>
                    <span className="font-semibold">{h.criterion}</span>: {h.winner} — {h.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {aiResult.verdict ? (
            <div className="mt-2">
              <div className="font-bold text-yellow-900">Verdict</div>
              <div className="mt-1 text-yellow-900">Winner: {aiResult.verdict.winner}</div>
              <div className="mt-1 text-yellow-900">{aiResult.verdict.summary}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


