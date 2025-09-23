"use client";

import React from "react";
import { motion } from "framer-motion";

const rectangles = [1, 2, 3, 4, 5];

interface PageLoaderProps {
  onComplete: () => void;
}

const PageLoader = ({ onComplete }: PageLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex">
      {rectangles.map((_, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-black"
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          transition={{
            duration: 0.6,
            delay: index * 0.3,
            ease: "easeInOut",
            onComplete: index === rectangles.length - 1 ? onComplete : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default PageLoader;
