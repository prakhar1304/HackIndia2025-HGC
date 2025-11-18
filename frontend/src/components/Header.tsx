"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { MenuIcon, SearchIcon, User2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useLocalAuth } from "@/context/LocalAuthContext";
import LottieBox from "@/components/LottieBox";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  const isLanding = pathname === "/";
  const { userId, isClient } = useLocalAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-black/50">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="size-3" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-3">
                <Link href="/home">Home</Link>
                <Link href="/innovation">Our Innovation</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center tracking-wide"
          >
            <LottieBox
              src="/animation/MovieTheatre.json"
              className="mr-2 size-16 border-0 p-0 shadow-none bg-transparent"
            />
            <span className="font-extrabold text-xl md:text-3xl">
              CuRecs
            </span>
          </Link>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-4" />

        <form
          onSubmit={onSearchSubmit}
          className="ml-auto flex w-full max-w-xl items-center gap-2 rounded-lg border bg-white p-1.5 shadow-sm dark:bg-black/30"
        >
          <Input
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-7 flex-1 border-0 focus-visible:ring-0"
          />
          <Button type="submit" className="h-8 text-sm">
            <SearchIcon className="mr-1 size-3" />
            Search
          </Button>
        </form>

        <nav className="hidden md:flex items-center gap-3 ml-3">
          <Link href="/home" className="hover:underline text-sm">
            Home
          </Link>
          <Link href="/innovation" className="hover:underline text-sm">
            Our Innovation
          </Link>
          {!isClient ? (
            // Show loading state during SSR to prevent hydration mismatch
            <div className="inline-flex items-center gap-1 rounded-md border-2 px-3 py-1 text-sm shadow-[3px_3px_0_0_#000]">
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
            </div>
          ) : !userId ? (
            <Link href="/onboarding" className="inline-flex items-center gap-1 rounded-md border-2 px-3 py-1 text-sm shadow-[3px_3px_0_0_#000]">Start</Link>
          ) : (
            <Link href="/profile" className="inline-flex items-center gap-1 rounded-md border-2 px-3 py-1 text-sm shadow-[3px_3px_0_0_#000]">
              <User2 className="size-3" />
              <span className="font-semibold">{userId}</span>
            </Link>
          )}
        </nav>
      </div>
      {isLanding && (
        <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,theme(colors.purple.600),theme(colors.purple.600)_10px,theme(colors.purple.400)_10px,theme(colors.purple.400)_20px)]" />
      )}
    </header>
  );
}


