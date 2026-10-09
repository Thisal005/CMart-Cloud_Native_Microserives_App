"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import styles from "@/app/home.module.css";

export function HomeProductImage({ src, name }: { src: string; name: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === src) {
    return (
      <span className={styles.imageFallback} role="img" aria-label={`${name}: image unavailable`}>
        <ImageOff size={32} strokeWidth={1.2} aria-hidden="true" />
        <span>Product image unavailable</span>
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes="(max-width: 700px) 100vw, 33vw"
      onError={() => setFailedSource(src)}
    />
  );
}
