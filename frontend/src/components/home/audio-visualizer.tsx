"use client";

import styles from "@/app/home.module.css";

export function AudioVisualizer() {
  return (
    <span className={styles.soundVisualizer} aria-hidden="true">
      <span className={styles.soundBar} style={{ animationDelay: "0ms" }} />
      <span className={styles.soundBar} style={{ animationDelay: "180ms" }} />
      <span className={styles.soundBar} style={{ animationDelay: "360ms" }} />
      <span className={styles.soundBar} style={{ animationDelay: "120ms" }} />
      <span className={styles.soundBar} style={{ animationDelay: "280ms" }} />
    </span>
  );
}
