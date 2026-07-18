"use client";

import * as React from "react";
import { ErrorLayout } from "@/components/layout/error-layout";

export default function RootErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorLayout error={error} reset={reset} />;
}
