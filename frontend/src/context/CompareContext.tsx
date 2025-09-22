"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ComparePick = { imdbID: string; Title: string; Poster: string; Genre?: string[]; Year?: string };

type CompareContextType = {
  open: boolean;
  picks: ComparePick[];
  setOpen: (v: boolean) => void;
  add: (p: ComparePick) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CompareCtx = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<ComparePick[]>([]);

  const value = useMemo<CompareContextType>(() => ({
    open,
    picks,
    setOpen,
    add(p) {
      setPicks((prev) => {
        if (prev.find((x) => x.imdbID === p.imdbID)) return prev;
        if (prev.length >= 2) return [prev[0], p];
        return [...prev, p];
      });
      setOpen(true);
    },
    remove(id) {
      setPicks((prev) => prev.filter((x) => x.imdbID !== id));
    },
    clear() {
      setPicks([]);
    },
  }), [open, picks]);

  return <CompareCtx.Provider value={value}>{children}</CompareCtx.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("CompareProvider missing");
  return ctx;
}


