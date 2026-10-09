// Copies the MediaPipe WASM runtime into /public so it is served from our own origin
// (no third-party script CDN; works with the Content-Security-Policy). Runs on `npm install`.
import { cpSync, existsSync, mkdirSync } from "node:fs";
const src = "node_modules/@mediapipe/tasks-vision/wasm";
const dest = "public/mediapipe/wasm";
if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log("✓ MediaPipe WASM copied to", dest);
} else {
  console.warn("MediaPipe package not found; skipping WASM copy");
}
