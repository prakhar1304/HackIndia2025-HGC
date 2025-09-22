"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createLocalUser, type LocalUserPayload } from "@/services/local/users";

type LocalAuth = {
  userId: string | null;
  profile: Partial<LocalUserPayload> | null;
  loading: boolean;
  start: (userId: string, base: Omit<LocalUserPayload, "userId">) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<LocalAuth | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<LocalUserPayload> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("localUserId");
    const rawProfile = localStorage.getItem("localUserProfile");
    if (raw) setUserId(raw);
    if (rawProfile) setProfile(JSON.parse(rawProfile));
    setLoading(false);
  }, []);

  async function start(uid: string, base: Omit<LocalUserPayload, "userId">) {
    setLoading(true);
    try {
      const res = await createLocalUser({ userId: uid, ...base });
      const finalId = res?.userId || uid;
      setUserId(finalId);
      setProfile(base as any);
      localStorage.setItem("localUserId", finalId);
      localStorage.setItem("localUserProfile", JSON.stringify(base));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUserId(null);
    setProfile(null);
    localStorage.removeItem("localUserId");
    localStorage.removeItem("localUserProfile");
  }

  const value = useMemo<LocalAuth>(() => ({ userId, profile, loading, start, logout }), [userId, profile, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocalAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLocalAuth must be inside LocalAuthProvider");
  return v;
}


