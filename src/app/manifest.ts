import type { MetadataRoute } from "next";

/** Installable web app ("Add to Home Screen") on Android and iOS. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VITALORA",
    short_name: "VITALORA",
    description: "Move Better. Eat Better. Live Better.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1220",
    theme_color: "#0F766E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "AI Coach", url: "/fitness/coach", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Habits", url: "/habits", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
