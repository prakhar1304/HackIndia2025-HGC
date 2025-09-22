"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompare } from "@/context/CompareContext";

export type SearchCardMovie = {
  imdbID: string;
  Title: string;
  Poster: string;
  Genre?: string[];
  Year?: string;
};

export default function SearchGridCard({ movie }: { movie: SearchCardMovie }) {
  const [imgError, setImgError] = useState(false);
  const { add } = useCompare();
  const hasValidPoster = !!movie.Poster && movie.Poster !== "N/A" && (movie.Poster.startsWith("http://") || movie.Poster.startsWith("https://") || movie.Poster.startsWith("/"));
  const posterSrc = !imgError && hasValidPoster ? movie.Poster : "/home/noimage.svg";

  return (
    <Card className="h-[430px] w-[280px] overflow-hidden border-2 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all bg-white relative">
      <div className="relative h-[250px] w-full">
        <Image src={posterSrc} alt={`${movie.Title} poster`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover object-center" onError={() => setImgError(true)} />
        <div className="absolute left-3 top-3 flex gap-2">
          {movie.Year ? (
            <Badge variant="secondary" className="border-black/10">{movie.Year}</Badge>
          ) : null}
        </div>
        <div className="pointer-events-none absolute bottom-2 right-2 z-0 h-32 w-32 bg-[url('/home/gradient.svg')] bg-no-repeat bg-contain" />
      </div>
      <CardHeader className="pt-0 pb-2">
        <CardTitle className="text-lg font-extrabold">{movie.Title}</CardTitle>
        <CardDescription>
          {(movie.Genre || []).map((g) => (
            <Badge key={g} variant="outline" className="mr-2 mt-2">
              {g}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0" />
      <CardFooter className="relative z-10 gap-2 pt-0">
        <Button size="sm" onClick={() => add({ imdbID: movie.imdbID, Title: movie.Title, Poster: movie.Poster, Genre: movie.Genre, Year: movie.Year })}>
          Add to Compare
        </Button>
      </CardFooter>
    </Card>
  );
}


