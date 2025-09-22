"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LottieBox({ src = "/animation/loader.json", className }: { src?: string; className?: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch(src)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [src]);

  return (
    <div className={cn("rounded-xl border-2 p-2 shadow-[6px_6px_0_0_#000] bg-white", className)}>
      {data ? (
        <Lottie animationData={data} loop autoplay />
      ) : (
        <div className="flex items-center justify-center p-6">
          <span className="size-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
}


