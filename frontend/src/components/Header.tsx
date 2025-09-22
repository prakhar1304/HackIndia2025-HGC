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
  const { userId } = useLocalAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-black/50">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-3">
                <Link href="/home">Home</Link>
                <Link href="/search">Search</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center font-extrabold text-lg md:text-xl tracking-wide">
            <LottieBox src="/animation/MovieTheatre.json" className="mr-2 size-20 border-0 p-0 shadow-none bg-transparent" />
            <span>Metta Match</span>
          </Link>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-6" />

        <form
          onSubmit={onSearchSubmit}
          className="ml-auto flex w-full max-w-xl items-center gap-2 rounded-lg border bg-white p-2 shadow-sm dark:bg-black/30"
        >
          <Input
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 flex-1 border-0 focus-visible:ring-0"
          />
          <Button type="submit" className="h-10">
            <SearchIcon className="mr-2 size-4" />
            Search
          </Button>
        </form>

        <nav className="hidden md:flex items-center gap-4 ml-4">
          <Link href="/home" className="hover:underline">
            Home
          </Link>
          <Link href="/search" className="hover:underline">
            Search
          </Link>
          {!userId ? (
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 shadow-[4px_4px_0_0_#000]">Start</Link>
          ) : (
            <Link href="/profile" className="inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 shadow-[4px_4px_0_0_#000]">
              <User2 className="size-4" />
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


