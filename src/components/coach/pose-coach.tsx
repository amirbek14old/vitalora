"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, Coins, Loader2, Sparkles, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CONNECTIONS, RepCounter, type CounterState, type Exercise, type FeedbackKey, type Landmark } from "@/lib/pose/analyze";
import { saveFormSessionAction } from "@/app/actions/coach";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/types";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

type Labels = Dictionary["coach"] & { errorGeneric: string; coinsEarned: string; notConfigured: string; rateLimited: string };
type PoseLandmarkerLike = { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks: Landmark[][] }; close: () => void };

type Status = "idle" | "loading" | "running" | "stopped" | "error";

/**
 * Camera form coach. Pose detection runs fully on the device (MediaPipe WASM);
 * frames never leave the phone. Only the final numbers are saved.
 */
export function PoseCoach({ labels, aiEnabled, speechLang }: { labels: Labels; aiEnabled: boolean; speechLang: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarkerLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const counterRef = useRef<RepCounter | null>(null);
  const startRef = useRef(0);
  const lastRepsRef = useRef(0);

  const [exercise, setExercise] = useState<Exercise>("pushup");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [state, setState] = useState<CounterState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sound, setSound] = useState(true);
  const [saved, setSaved] = useState<{ coins: number } | null>(null);
  const [ai, setAi] = useState<{ status: "idle" | "loading" | "done" | "error"; text?: string }>({ status: "idle" });

  const speak = useCallback(
    (text: string) => {
      if (!sound || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      u.rate = 1.1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [sound, speechLang],
  );

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    stopCamera();
    landmarkerRef.current?.close();
  }, [stopCamera]);

  async function loadModel(): Promise<PoseLandmarkerLike> {
    if (landmarkerRef.current) return landmarkerRef.current;
    const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
    const make = (delegate: "GPU" | "CPU") =>
      PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    const lm = (await make("GPU").catch(() => make("CPU"))) as unknown as PoseLandmarkerLike;
    landmarkerRef.current = lm;
    return lm;
  }

  function draw(lm: Landmark[] | undefined) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!lm) return;
    const W = canvas.width, H = canvas.height;
    ctx.lineWidth = Math.max(3, W / 160);
    ctx.strokeStyle = "#2DD4BF";
    for (const [a, b] of CONNECTIONS) {
      const p = lm[a], q = lm[b];
      if ((p.visibility ?? 1) < 0.4 || (q.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.moveTo(p.x * W, p.y * H);
      ctx.lineTo(q.x * W, q.y * H);
      ctx.stroke();
    }
    ctx.fillStyle = "#F8FAFC";
    for (const i of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
      const p = lm[i];
      if ((p.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, Math.max(4, W / 110), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  async function start() {
    setError("");
    setSaved(null);
    setAi({ status: "idle" });
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError(labels.noCamera);
      return;
    }
    setStatus("loading");
    try {
      const [stream, landmarker] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
        loadModel(),
      ]);
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      counterRef.current = new RepCounter(exercise);
      lastRepsRef.current = 0;
      startRef.current = performance.now();
      setState({ ...counterRef.current.state });
      setStatus("running");
      speak("3, 2, 1");

      let lastVideoTime = -1;
      let lastUi = 0;
      const loop = () => {
        const v = videoRef.current;
        if (!v || !counterRef.current) return;
        const now = performance.now();
        if (v.currentTime !== lastVideoTime && v.readyState >= 2) {
          lastVideoTime = v.currentTime;
          const res = landmarker.detectForVideo(v, now);
          const lm = res.landmarks?.[0];
          draw(lm);
          const s = counterRef.current.update(lm, now);
          if (s.reps !== lastRepsRef.current) {
            lastRepsRef.current = s.reps;
            speak(String(s.reps));
          }
          if (now - lastUi > 150) {
            lastUi = now;
            setState({ ...s, scores: [...s.scores] });
            setElapsed(Math.round((now - startRef.current) / 1000));
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      stopCamera();
      setStatus("error");
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" || name === "SecurityError" ? labels.cameraDenied : name === "NotFoundError" ? labels.noCamera : labels.modelError);
    }
  }

  async function stop() {
    stopCamera();
    const c = counterRef.current;
    setStatus("stopped");
    if (!c) return;
    const durationSec = Math.max(5, Math.round((performance.now() - startRef.current) / 1000));
    setState({ ...c.state });
    setElapsed(durationSec);
    if (c.state.reps === 0) return;
    const res = await saveFormSessionAction({ exercise, reps: c.state.reps, goodReps: c.state.goodReps, avgScore: c.averageScore, durationSec });
    if (res.ok) {
      setSaved({ coins: res.coins });
      router.refresh();
    } else setError(labels.errorGeneric);
  }

  async function aiTips() {
    const c = counterRef.current;
    if (!c) return;
    setAi({ status: "loading" });
    const issues = Object.entries(c.state.issueCounts).map(([k, n]) => `${k}: ${n}`).join(", ") || "none";
    const message = `Exercise: ${exercise}. Reps: ${c.state.reps}. Good reps: ${c.state.goodReps}. Average form score: ${c.averageScore}/100. Duration: ${elapsed}s. Detected issues (count): ${issues}.`;
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "form", message }) });
      const data = await res.json();
      if (!res.ok) {
        setAi({ status: "error", text: data.error === "not_configured" ? labels.notConfigured : data.error === "rate_limited" ? labels.rateLimited : labels.errorGeneric });
        return;
      }
      setAi({ status: "done", text: data.reply });
    } catch {
      setAi({ status: "error", text: labels.errorGeneric });
    }
  }

  const fb = (k: FeedbackKey) => labels.feedback[k];
  const running = status === "running";
  const avg = state?.scores.length ? Math.round(state.scores.reduce((a, b) => a + b, 0) / state.scores.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={labels.exercise}>
        {(["pushup", "squat"] as const).map((ex) => (
          <button
            key={ex}
            type="button"
            role="radio"
            aria-checked={exercise === ex}
            disabled={running || status === "loading"}
            onClick={() => setExercise(ex)}
            className={cn("rounded-full px-4 py-2 text-sm font-medium", exercise === ex ? "bg-brand-700 text-white dark:bg-brand-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800")}
          >
            {ex === "pushup" ? labels.pushup : labels.squat}
          </button>
        ))}
        <button type="button" onClick={() => setSound((s) => !s)} className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800" aria-pressed={sound}>
          {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          {labels.sound}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-slate-900" style={{ aspectRatio: "4 / 3" }}>
        {/* Mirrored like a selfie camera; the overlay is mirrored the same way. */}
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover" aria-hidden />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            {status === "loading" ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
                <p>{labels.loading}</p>
              </>
            ) : (
              <>
                <Camera className="h-10 w-10 opacity-80" aria-hidden />
                <p className="max-w-xs text-sm opacity-90">{labels.placement}</p>
              </>
            )}
          </div>
        )}
        {running && state && (
          <>
            <div className="absolute left-3 top-3 rounded-2xl bg-black/60 px-4 py-2 text-white" aria-live="polite">
              <p className="text-4xl font-bold leading-none">{state.reps}</p>
              <p className="text-xs opacity-80">{labels.reps}</p>
            </div>
            <div className="absolute right-3 top-3 rounded-xl bg-black/60 px-3 py-1.5 text-right text-xs text-white">
              <p>{labels.goodReps}: <strong>{state.goodReps}</strong></p>
              <p>{labels.time}: {elapsed}s</p>
            </div>
            <div
              className={cn(
                "absolute inset-x-3 bottom-3 rounded-xl px-4 py-3 text-center text-base font-semibold text-white",
                state.live === "great" ? "bg-emerald-600/90" : state.live === "notVisible" || state.live === "getReady" ? "bg-slate-700/90" : "bg-amber-600/90",
              )}
              role="status"
            >
              {fb(state.live)}
              {state.lastRep && <span className="ml-2 text-xs font-normal opacity-90">· {labels.lastScore}: {state.lastRep.score}</span>}
            </div>
          </>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        {running ? (
          <Button variant="danger" size="lg" onClick={stop} className="flex-1 sm:flex-none">
            <Square className="h-4 w-4" aria-hidden />{labels.stop}
          </Button>
        ) : (
          <Button size="lg" onClick={start} disabled={status === "loading"} className="flex-1 sm:flex-none">
            {status === "error" ? <CameraOff className="h-4 w-4" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
            {status === "stopped" ? labels.again : labels.start}
          </Button>
        )}
      </div>

      {status === "stopped" && state && (
        <section aria-labelledby="coach-summary" className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h2 id="coach-summary" className="font-semibold">{labels.summary}</h2>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt className="text-xs text-slate-500">{labels.reps}</dt><dd className="text-2xl font-bold">{state.reps}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt className="text-xs text-slate-500">{labels.goodReps}</dt><dd className="text-2xl font-bold">{state.goodReps}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt className="text-xs text-slate-500">{labels.avgScore}</dt><dd className="text-2xl font-bold">{avg}</dd></div>
          </dl>
          {Object.keys(state.issueCounts).length > 0 && (
            <ul className="space-y-1 text-sm">
              {(Object.entries(state.issueCounts) as [FeedbackKey, number][]).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <li key={k} className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/40"><span>{fb(k)}</span><span className="text-slate-500">×{n}</span></li>
              ))}
            </ul>
          )}
          {state.reps === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">{labels.noReps}</p>}
          {saved && (
            <Alert tone="success">
              <span className="inline-flex items-center gap-1"><Coins className="h-4 w-4" aria-hidden />{labels.saved} {saved.coins > 0 && labels.coinsEarned.replace("{n}", String(saved.coins))}</span>
            </Alert>
          )}
          {state.reps > 0 && aiEnabled && (
            <div className="space-y-2" aria-live="polite">
              <Button variant="secondary" onClick={aiTips} disabled={ai.status === "loading"}>
                <Sparkles className="h-4 w-4" aria-hidden />{ai.status === "loading" ? labels.thinking : labels.aiTips}
              </Button>
              {ai.status === "done" && <p className="whitespace-pre-line rounded-xl bg-brand-50 p-3 text-sm dark:bg-brand-900/30">{ai.text}</p>}
              {ai.status === "error" && <Alert tone="warning">{ai.text}</Alert>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
