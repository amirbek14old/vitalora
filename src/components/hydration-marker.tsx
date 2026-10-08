"use client";
import { useEffect } from "react";

/** Marks the document once React has hydrated (used by end-to-end tests to avoid racing hydration). */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
