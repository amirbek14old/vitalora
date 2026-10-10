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
  | "getIntoPlank"
  | "standUp"
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

/** Pick the body side that the camera sees best. For push-ups only the arm counts (legs are often out of frame). */
function side(lm: Landmark[], armsOnly = false) {
  const left = [LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST, LM.L_HIP, LM.L_KNEE, LM.L_ANKLE];
  const right = [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST, LM.R_HIP, LM.R_KNEE, LM.R_ANKLE];
  const score = (idx: number[]) => (armsOnly ? idx.slice(0, 3) : idx).reduce((a, i) => a + vis(lm[i]), 0) / (armsOnly ? 3 : idx.length);
  const useLeft = score(left) >= score(right);
  const [s, e, w, h, k, a] = useLeft ? left : right;
  return { s: lm[s], e: lm[e], w: lm[w], h: lm[h], k: lm[k], a: lm[a] };
}

export type Metrics = {
  visible: boolean;
  elbow: number;
  body: number;
  knee: number;
  torsoLean: number;
  /** Shin (knee→ankle) angle from vertical: ~0° standing/squatting, ~90° in a plank. */
  shinTilt: number;
  /** Shoulder→ankle line angle from horizontal: ~0° in a plank, ~90° standing. */
  bodyTilt: number;
  shoulderY: number;
  hipY: number;
  upperArm: number;
  thigh: number;
  /** Push-ups: shoulder height above the wrist ÷ arm length. ~1 with straight arms, ~0.4–0.5 at the bottom. Works from the side or the front. */
  armHeight: number;
  /** (hip.y − shoulder.y) ÷ torso length: ~0.8–1 standing/squatting, < 0.5 in a plank. null when the hip isn't visible. */
  torsoVertical: number | null;
  /** Body line shoulder–hip–ankle, only when hip and ankle are visible (side view). */
  bodyLine: number | null;
  /** Clearly standing/squatting (push-up mode rejects these frames). */
  standing: boolean;
};

const tiltFromVertical = (a: Landmark, b: Landmark) => (Math.atan2(Math.abs(b.x - a.x), Math.abs(b.y - a.y) || 1e-6) * 180) / Math.PI;
const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

const HIDDEN: Metrics = { visible: false, elbow: 180, body: 180, knee: 180, torsoLean: 0, shinTilt: 0, bodyTilt: 90, shoulderY: 0, hipY: 0, upperArm: 0, thigh: 0, armHeight: 1, torsoVertical: null, bodyLine: null, standing: false };

export function metrics(lm: Landmark[], exercise: Exercise, minVisibility = 0.5): Metrics {
  if (exercise === "pushup") return pushupMetrics(lm, Math.min(minVisibility, 0.4));
  const p = side(lm);
  const needed = [p.s, p.h, p.k, p.a];
  const visible = needed.every((x) => x && vis(x) >= minVisibility);
  if (!visible) return HIDDEN;
  // Torso lean: angle between hip→shoulder and straight up (image y grows downward).
  const dx = p.s.x - p.h.x, dy = p.h.y - p.s.y;
  const torsoLean = (Math.atan2(Math.abs(dx), Math.max(1e-6, dy)) * 180) / Math.PI;
  return {
    ...HIDDEN,
    visible: true,
    elbow: p.e && p.w ? angle(p.s, p.e, p.w) : 180,
    body: angle(p.s, p.h, p.a),
    knee: angle(p.h, p.k, p.a),
    torsoLean: dy <= 0 ? 90 : torsoLean,
    shinTilt: tiltFromVertical(p.k, p.a),
    bodyTilt: 90 - tiltFromVertical(p.s, p.a),
    shoulderY: p.s.y,
    hipY: p.h.y,
    thigh: dist(p.h, p.k),
  };
}

/**
 * Push-up metrics need only the shoulders and arms — so it works with the phone in front of you or to the side.
 * Both arms are averaged when visible; if the hands are out of frame, the elbows are used instead.
 * `handDrop` = how far the hands are below the shoulders (image units). The counter compares it with the
 * value at the top of the push-up, so perspective and arm foreshortening don't matter.
 */
function pushupMetrics(lm: Landmark[], minVisibility: number): Metrics {
  const sides = [
    { s: lm[LM.L_SHOULDER], e: lm[LM.L_ELBOW], w: lm[LM.L_WRIST], h: lm[LM.L_HIP], k: lm[LM.L_KNEE], a: lm[LM.L_ANKLE] },
    { s: lm[LM.R_SHOULDER], e: lm[LM.R_ELBOW], w: lm[LM.R_WRIST], h: lm[LM.R_HIP], k: lm[LM.R_KNEE], a: lm[LM.R_ANKLE] },
  ];
  const drops: number[] = [];
  const shoulders: number[] = [];
  let upperArm = 0;
  let elbow = 180;
  for (const p of sides) {
    if (!p.s || vis(p.s) < minVisibility || !p.e || vis(p.e) < minVisibility) continue;
    const ua = dist(p.s, p.e);
    if (ua < 0.01) continue;
    upperArm = Math.max(upperArm, ua);
    shoulders.push(p.s.y);
    if (p.w && vis(p.w) >= minVisibility && dist(p.e, p.w) > 0.01) {
      drops.push(p.w.y - p.s.y);
      elbow = Math.min(elbow, angle(p.s, p.e, p.w));
    } else {
      drops.push(2 * (p.e.y - p.s.y)); // hands out of frame: the elbow is about half-way down the arm
    }
  }
  if (!drops.length) return HIDDEN;
  const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  const handDrop = avg(drops);

  // Best-seen side for the optional body-line and "is the person standing?" checks.
  const p = side(lm);
  const ok = (l: Landmark | undefined, t = 0.6) => !!l && vis(l) >= t;
  const torso = ok(p.h) ? dist(p.s, p.h) : 0;
  const torsoVertical = torso > 0.02 ? (p.h.y - p.s.y) / torso : null;
  // Clearly standing or squatting: upright torso with knees visible well below the hips.
  const standing = torsoVertical != null && torsoVertical > 0.7 && ok(p.k) && p.k.y - p.h.y > 0.5 * torso;
  return {
    ...HIDDEN,
    visible: true,
    elbow,
    shoulderY: avg(shoulders),
    upperArm,
    armHeight: handDrop, // raw; normalised by the counter
    torsoVertical,
    standing,
    bodyLine: ok(p.h, 0.5) && ok(p.a, 0.5) ? angle(p.s, p.h, p.a) : null,
  };
}

/** Is the body in the right position for the chosen exercise? (Stops squats counting as push-ups and vice versa.) */
export function postureOk(m: Metrics, exercise: Exercise): boolean {
  // Push-up: hands below the shoulders and not clearly standing.
  if (exercise === "pushup") return m.armHeight > 0.01 && !m.standing;
  return m.shinTilt < 55 && m.bodyTilt > 45; // standing / squatting upright
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

/** Minimum shoulder/hip travel during a rep, as a share of the upper-arm/thigh length. */
const MIN_TRAVEL = { pushup: 0.25, squat: 0.3 };

const CFG = {
  // Push-up thresholds are on armHeight (shoulder height above the hands ÷ arm length), not on an angle.
  pushup: { down: 0.75, up: 0.9, goodDepth: 0.65, lockout: 0.93, bodyMin: 160, bodyWarn: 150 },
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
  private minY = Infinity; // shoulder (push-up) or hip (squat) height range during the rep
  private maxY = -Infinity;
  private segment = 0; // upper arm (push-up) or thigh (squat) length, to normalise the movement
  private topRef = 0; // push-ups: hands-below-shoulders distance with straight arms (auto-calibrated)
  /** Live numbers for the on-screen debug readout (?debug=1). */
  debug: { value: number; ref: number; visible: boolean; posture: boolean } = { value: 0, ref: 0, visible: false, posture: false };

  constructor(public readonly exercise: Exercise, private readonly alpha = 0.5) {}

  update(lm: Landmark[] | undefined, timeMs: number): CounterState {
    if (!lm || lm.length < 29) return this.set("notVisible");
    const m = metrics(lm, this.exercise);
    this.debug = { value: this.smooth ?? 0, ref: this.topRef, visible: m.visible, posture: m.visible && postureOk(m, this.exercise) };
    if (!m.visible) return this.set("notVisible");
    if (!postureOk(m, this.exercise)) {
      // Wrong position for this exercise: drop any rep in progress and tell the user how to get into position.
      this.resetRep();
      this.state.phase = "up";
      return this.set(this.exercise === "pushup" ? "getIntoPlank" : "standUp");
    }

    let raw = m.knee;
    if (this.exercise === "pushup") {
      // Calibrate on the highest position seen (straight arms). Slowly forget, so moving closer/further from the camera is fine.
      this.topRef = Math.max(m.armHeight, this.topRef * 0.997);
      raw = m.armHeight / this.topRef; // 1 at the top, ~0.4–0.6 at the bottom
    }
    this.smooth = this.smooth == null ? raw : this.alpha * raw + (1 - this.alpha) * this.smooth;
    const a = this.smooth;
    const cfg = CFG[this.exercise];

    if (this.state.phase === "up") {
      this.topAngle = Math.max(this.topAngle, a);
      if (a < cfg.down) {
        this.state.phase = "down";
        this.repStart = this.repStart || timeMs;
      } else if (a < cfg.up - (this.exercise === "pushup" ? 0.04 : 5) && this.repStart === 0) {
        this.repStart = timeMs; // started descending
      }
    } else if (a > cfg.up) {
      this.finishRep(timeMs);
    }

    // Track the worst values during the rep (from the start of the descent).
    if (this.repStart) {
      this.minMain = Math.min(this.minMain, a);
      this.worstBody = Math.min(this.worstBody, this.exercise === "pushup" ? m.bodyLine ?? 180 : m.body);
      this.maxLean = Math.max(this.maxLean, m.torsoLean);
      const y = this.exercise === "pushup" ? m.shoulderY : m.hipY;
      this.minY = Math.min(this.minY, y);
      this.maxY = Math.max(this.maxY, y);
      this.segment = Math.max(this.segment, this.exercise === "pushup" ? m.upperArm : m.thigh);
    }

    // Live cue
    let live: FeedbackKey = this.state.lastRep?.good ? "great" : this.state.reps ? this.state.live : "getReady";
    if (this.exercise === "pushup" && m.bodyLine != null && m.bodyLine < CFG.pushup.bodyWarn) live = "keepBodyStraight";
    else if (this.exercise === "squat" && m.torsoLean > CFG.squat.leanMax) live = "chestUp";
    else if (this.state.phase === "down" || (this.repStart && a < cfg.up)) live = a > cfg.goodDepth ? "goLower" : "great";
    return this.set(live);
  }

  private finishRep(timeMs: number) {
    const cfg = CFG[this.exercise];
    // The body must actually move (shoulders go down in a push-up, hips go down in a squat) —
    // bending only the arms or knees in place doesn't count.
    const moved = this.segment > 0 && this.maxY - this.minY >= MIN_TRAVEL[this.exercise] * this.segment;
    if (!moved) {
      this.resetRep();
      this.state.phase = "up";
      return;
    }
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
    this.resetRep();
  }

  private resetRep() {
    this.repStart = 0;
    this.minMain = 180;
    this.worstBody = 180;
    this.maxLean = 0;
    this.topAngle = 0;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.segment = 0;
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
