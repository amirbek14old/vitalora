/**
 * On-device exercise form analysis from MediaPipe Pose landmarks (33 points, normalised 0..1).
 * Pure functions — no browser APIs — so the logic is unit-tested.
 * This is a coaching aid, not a medical or biomechanical assessment.
 */

export type Landmark = { x: number; y: number; z?: number; visibility?: number };
export type Exercise = "pushup" | "squat";

export type FeedbackKey =
  | "notVisible"
  | "getReady"
  | "goLower"
  | "keepBodyStraight"
  | "fullExtension"
  | "slowDown"
  | "chestUp"
  | "standTall"
  | "great";

export const LM = {
  L_SHOULDER: 11, R_SHOULDER: 12, L_ELBOW: 13, R_ELBOW: 14, L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28,
} as const;

/** Skeleton lines to draw on the overlay. */
export const CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
];

/** Angle ABC in degrees (0..180). Uses x/y only (image plane). */
export function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (m === 0) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180) / Math.PI;
}

const vis = (l: Landmark | undefined) => (l?.visibility ?? 1);

/** Pick the body side that the camera sees best (side view works best). */
function side(lm: Landmark[]) {
  const left = [LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST, LM.L_HIP, LM.L_KNEE, LM.L_ANKLE];
  const right = [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST, LM.R_HIP, LM.R_KNEE, LM.R_ANKLE];
  const score = (idx: number[]) => idx.reduce((a, i) => a + vis(lm[i]), 0) / idx.length;
  const useLeft = score(left) >= score(right);
  const [s, e, w, h, k, a] = useLeft ? left : right;
  return { s: lm[s], e: lm[e], w: lm[w], h: lm[h], k: lm[k], a: lm[a] };
}

export type Metrics = { visible: boolean; elbow: number; body: number; knee: number; torsoLean: number };

export function metrics(lm: Landmark[], exercise: Exercise, minVisibility = 0.5): Metrics {
  const p = side(lm);
  const needed = exercise === "pushup" ? [p.s, p.e, p.w, p.h, p.a] : [p.s, p.h, p.k, p.a];
  const visible = needed.every((x) => x && vis(x) >= minVisibility);
  if (!visible) return { visible: false, elbow: 180, body: 180, knee: 180, torsoLean: 0 };
  // Torso lean: angle between hip→shoulder and straight up (image y grows downward).
  const dx = p.s.x - p.h.x, dy = p.h.y - p.s.y;
  const torsoLean = (Math.atan2(Math.abs(dx), Math.max(1e-6, dy)) * 180) / Math.PI;
  return {
    visible: true,
    elbow: angle(p.s, p.e, p.w),
    body: angle(p.s, p.h, p.a),
    knee: angle(p.h, p.k, p.a),
    torsoLean: dy <= 0 ? 90 : torsoLean,
  };
}

export type RepResult = { score: number; good: boolean; issues: FeedbackKey[] };

export type CounterState = {
  reps: number;
  goodReps: number;
  phase: "up" | "down";
  live: FeedbackKey;
  lastRep: RepResult | null;
  scores: number[];
  issueCounts: Partial<Record<FeedbackKey, number>>;
};

const CFG = {
  pushup: { down: 95, up: 150, goodDepth: 100, lockout: 155, bodyMin: 160, bodyWarn: 150 },
  squat: { down: 100, up: 160, goodDepth: 110, lockout: 165, leanMax: 50 },
};

/**
 * Rep counter with hysteresis: a rep counts when the main joint angle goes below `down`
 * and then back above `up`. Each completed rep gets a 0–100 score with specific issues.
 */
export class RepCounter {
  state: CounterState = { reps: 0, goodReps: 0, phase: "up", live: "getReady", lastRep: null, scores: [], issueCounts: {} };
  private smooth: number | null = null;
  private repStart = 0;
  private minMain = 180;
  private worstBody = 180;
  private maxLean = 0;
  private topAngle = 0;

  constructor(public readonly exercise: Exercise, private readonly alpha = 0.5) {}

  update(lm: Landmark[] | undefined, timeMs: number): CounterState {
    if (!lm || lm.length < 29) return this.set("notVisible");
    const m = metrics(lm, this.exercise);
    if (!m.visible) return this.set("notVisible");

    const raw = this.exercise === "pushup" ? m.elbow : m.knee;
    this.smooth = this.smooth == null ? raw : this.alpha * raw + (1 - this.alpha) * this.smooth;
    const a = this.smooth;
    const cfg = CFG[this.exercise];

    if (this.state.phase === "up") {
      this.topAngle = Math.max(this.topAngle, a);
      if (a < cfg.down) {
        this.state.phase = "down";
        this.repStart = this.repStart || timeMs;
      } else if (a < cfg.up - 5 && this.repStart === 0) {
        this.repStart = timeMs; // started descending
      }
    } else if (a > cfg.up) {
      this.finishRep(timeMs);
    }

    // Track the worst values during the rep (from the start of the descent).
    if (this.repStart) {
      this.minMain = Math.min(this.minMain, a);
      this.worstBody = Math.min(this.worstBody, m.body);
      this.maxLean = Math.max(this.maxLean, m.torsoLean);
    }

    // Live cue
    let live: FeedbackKey = this.state.lastRep?.good ? "great" : this.state.reps ? this.state.live : "getReady";
    if (this.exercise === "pushup" && m.body < CFG.pushup.bodyWarn) live = "keepBodyStraight";
    else if (this.exercise === "squat" && m.torsoLean > CFG.squat.leanMax) live = "chestUp";
    else if (this.state.phase === "down" || (this.repStart && a < cfg.up)) live = a > cfg.goodDepth ? "goLower" : "great";
    return this.set(live);
  }

  private finishRep(timeMs: number) {
    const cfg = CFG[this.exercise];
    const issues: FeedbackKey[] = [];
    let score = 100;
    if (this.minMain > cfg.goodDepth) { score -= 30; issues.push("goLower"); }
    if (this.exercise === "pushup" && this.worstBody < CFG.pushup.bodyMin) { score -= 30; issues.push("keepBodyStraight"); }
    if (this.exercise === "squat" && this.maxLean > CFG.squat.leanMax) { score -= 25; issues.push("chestUp"); }
    if (this.topAngle > 0 && this.topAngle < cfg.lockout) { score -= 15; issues.push(this.exercise === "pushup" ? "fullExtension" : "standTall"); }
    const duration = timeMs - this.repStart;
    if (this.repStart && duration < 600) { score -= 10; issues.push("slowDown"); }
    score = Math.max(0, score);
    const good = score >= 70;

    const s = this.state;
    s.reps += 1;
    if (good) s.goodReps += 1;
    s.scores.push(score);
    s.lastRep = { score, good, issues };
    for (const i of issues) s.issueCounts[i] = (s.issueCounts[i] ?? 0) + 1;
    s.phase = "up";

    this.repStart = 0;
    this.minMain = 180;
    this.worstBody = 180;
    this.maxLean = 0;
    this.topAngle = 0;
  }

  private set(live: FeedbackKey): CounterState {
    this.state.live = live;
    return this.state;
  }

  get averageScore(): number {
    const s = this.state.scores;
    return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0;
  }
}
