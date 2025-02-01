"use client";

import { motion } from "motion/react";

import { cn } from "@nzc/ui/utils/cn";

export function TextShine({
  text,
  duration = 2,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.h1
      className={cn(
        "bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent",
        className,
      )}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration,
        ease: "linear",
      }}
    >
      {text}
    </motion.h1>
  );
}
