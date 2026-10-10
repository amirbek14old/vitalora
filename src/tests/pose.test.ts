import { describe, expect, it } from "vitest";
import { angle, metrics, RepCounter, LM, type Landmark } from "@/lib/pose/analyze";

/** Side-view push-up: wrist on the floor, forearm vertical, shoulder moves down as the elbow bends.
 *  hipOffset > 0 = sagging hips, < 0 = pike. */
function pushupPose(elbowDeg: number, hipOffset = 0): Landmark[] {
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0.1 }));
  const floor = 0.8, u = 0.12;
  const W = { x: 0.3, y: floor };
  const E = { x: 0.3, y: floor - u };
  const r = (elbowDeg * Math.PI) / 180;
  const S = { x: E.x + u * Math.sin(r), y: E.y + u * Math.cos(r) };
  const A = { x: 0.95, y: floor - 0.02 };
  const lerp = (t: number) => ({ x: S.x + (A.x - S.x) * t, y: S.y + (A.y - S.y) * t });
  const H = { ...lerp(0.45), y: lerp(0.45).y + hipOffset };
  const K = lerp(0.75);
  const set = (i: number, p: { x: number; y: number }) => (lm[i] = { ...p, visibility: 0.99 });
  set(LM.L_SHOULDER, S); set(LM.L_ELBOW, E); set(LM.L_WRIST, W); set(LM.L_HIP, H); set(LM.L_KNEE, K); set(LM.L_ANKLE, A);
  return lm;
}

/** Side-view squat with knee angle and torso lean. */
function squatPose(kneeDeg: number, leanDeg = 10): Landmark[] {
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0.1 }));
  const A = { x: 0.5, y: 0.9 }, K = { x: 0.5, y: 0.7 };
  const r = ((180 - kneeDeg) * Math.PI) / 180;
  const H = { x: K.x - 0.2 * Math.sin(r), y: K.y - 0.2 * Math.cos(r) };
  const l = (leanDeg * Math.PI) / 180;
  const S = { x: H.x + 0.25 * Math.sin(l), y: H.y - 0.25 * Math.cos(l) };
  const set = (i: number, p: { x: number; y: number }) => (lm[i] = { ...p, visibility: 0.99 });
  // Arms swing from hanging down (standing) to straight forward (bottom of the squat) — the classic way
  // squats could fool a push-up counter.
  const armA = (((175 - kneeDeg) / 90) * Math.PI) / 2;
  const E = { x: S.x + 0.12 * Math.sin(armA), y: S.y + 0.12 * Math.cos(armA) };
  const W = { x: S.x + 0.24 * Math.sin(armA), y: S.y + 0.24 * Math.cos(armA) };
  set(LM.L_SHOULDER, S); set(LM.L_HIP, H); set(LM.L_KNEE, K); set(LM.L_ANKLE, A); set(LM.L_ELBOW, E); set(LM.L_WRIST, W);
  return lm;
}

function run(counter: RepCounter, frames: Landmark[][], msPerFrame = 50) {
  let t = 0;
  for (const f of frames) counter.update(f, (t += msPerFrame));
  return counter.state;
}

const sweep = (from: number, to: number, steps: number) => Array.from({ length: steps }, (_, i) => from + ((to - from) * i) / (steps - 1));

describe("geometry", () => {
  it("computes joint angles", () => {
    expect(Math.round(angle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }))).toBe(90);
    expect(Math.round(angle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }))).toBe(180);
    const m = metrics(pushupPose(90), "pushup");
    expect(Math.round(m.elbow)).toBe(90);
    expect(Math.round(m.body)).toBe(180);
    expect(m.armHeight).toBeCloseTo(0.12, 2); // hands are one forearm below the shoulder at 90°
    expect(Math.round(m.bodyLine ?? 0)).toBe(180);
  });

  it("reports when the body is not visible", () => {
    const lm = pushupPose(170).map((p) => ({ ...p, visibility: 0.1 }));
    const c = new RepCounter("pushup");
    expect(c.update(lm, 0).live).toBe("notVisible");
  });
});

describe("push-up counter", () => {
  const rep = (low: number, hip = 0) => [...sweep(170, low, 12), ...sweep(low, 170, 12)].map((a) => pushupPose(a, hip));

  it("counts good reps with full depth and straight body", () => {
    const s = run(new RepCounter("pushup"), [...rep(75), ...rep(75), ...rep(75)]);
    expect(s.reps).toBe(3);
    expect(s.goodReps).toBe(3);
    expect(s.lastRep?.issues).toEqual([]);
  });

  it("does not count half reps that never go below the threshold", () => {
    const s = run(new RepCounter("pushup"), rep(120));
    expect(s.reps).toBe(0);
  });

  it("flags sagging hips", () => {
    const s = run(new RepCounter("pushup"), rep(75, 0.08));
    expect(s.reps).toBe(1);
    expect(s.lastRep?.issues).toContain("keepBodyStraight");
  });

  it("flags reps that are too fast", () => {
    const fast = [...sweep(170, 70, 4), ...sweep(70, 170, 4)].map((a) => pushupPose(a));
    const s = run(new RepCounter("pushup", 1), fast, 40);
    expect(s.reps).toBe(1);
    expect(s.lastRep?.issues).toContain("slowDown");
  });
});

describe("squat counter", () => {
  const rep = (low: number, lean = 10) => [...sweep(175, low, 12), ...sweep(low, 175, 12)].map((k) => squatPose(k, lean));

  it("counts deep squats", () => {
    const s = run(new RepCounter("squat"), [...rep(85), ...rep(85)]);
    expect(s.reps).toBe(2);
    expect(s.goodReps).toBe(2);
  });

  it("flags excessive forward lean", () => {
    const s = run(new RepCounter("squat"), rep(85, 65));
    expect(s.lastRep?.issues).toContain("chestUp");
  });
});

describe("push-up camera angles", () => {
  /** Phone on the floor in front of you: we see shoulders and arms from the front, hips hidden. */
  function frontPose(armHeight: number): Landmark[] {
    const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0.05 }));
    const floor = 0.85, u = 0.15;
    const set = (i: number, p: { x: number; y: number }) => (lm[i] = { ...p, visibility: 0.95 });
    for (const [s, e, w, x] of [[LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST, 0.35], [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST, 0.65]] as const) {
      const sy = floor - armHeight * 2 * u;
      const ey = (sy + floor) / 2;
      const flare = Math.sqrt(Math.max(0, u * u - (floor - ey) ** 2)); // elbows flare out when bent
      set(w, { x, y: floor });
      set(e, { x: x + (x < 0.5 ? -flare : flare), y: ey });
      set(s, { x, y: sy });
    }
    return lm;
  }

  it("counts push-ups filmed from the front (no hips or feet in view)", () => {
    const rep = [...sweep(0.97, 0.45, 12), ...sweep(0.45, 0.97, 12)].map(frontPose);
    const s = run(new RepCounter("pushup"), [...rep, ...rep, ...rep]);
    expect(s.reps).toBe(3);
    expect(s.goodReps).toBe(3);
  });

  it("counts push-ups with elbows tucked back (upper arm foreshortened in a front view)", () => {
    // Only the height of the shoulders above the hands changes; arm length on screen shrinks at the bottom.
    const pose = (drop: number) => {
      const lm = frontPose(1);
      for (const [s, e, w] of [[LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST], [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST]] as const) {
        lm[s] = { ...lm[s], y: lm[w].y - drop };
        lm[e] = { ...lm[e], x: lm[w].x, y: lm[w].y - Math.min(drop, 0.15) + 0.02 };
      }
      return lm;
    };
    const rep = [...sweep(0.3, 0.16, 12), ...sweep(0.16, 0.3, 12)].map(pose);
    expect(run(new RepCounter("pushup"), [...rep, ...rep]).reps).toBe(2);
  });

  it("still counts when the hands are out of the frame (uses the elbows)", () => {
    const rep = [...sweep(0.97, 0.45, 12), ...sweep(0.45, 0.97, 12)].map((h) => {
      const lm = frontPose(h);
      lm[LM.L_WRIST] = { ...lm[LM.L_WRIST], visibility: 0.05 };
      lm[LM.R_WRIST] = { ...lm[LM.R_WRIST], visibility: 0.05 };
      return lm;
    });
    expect(run(new RepCounter("pushup"), [...rep, ...rep]).reps).toBe(2);
  });

  it("counts reasonably deep push-ups (elbows ~100°) as reps", () => {
    const rep = [...sweep(170, 100, 12), ...sweep(100, 170, 12)].map((a) => pushupPose(a));
    expect(run(new RepCounter("pushup"), rep).reps).toBe(1);
  });
});

describe("exercise position check", () => {
  it("does not count squats while push-ups are selected", () => {
    const squats = [...sweep(175, 85, 12), ...sweep(85, 175, 12)].map((k) => squatPose(k));
    const c = new RepCounter("pushup");
    const s = run(c, [...squats, ...squats]);
    expect(s.reps).toBe(0);
    expect(s.live).toBe("getIntoPlank");
  });

  it("does not count push-ups while squats are selected", () => {
    const pushups = [...sweep(170, 75, 12), ...sweep(75, 170, 12)].map((a) => pushupPose(a));
    const c = new RepCounter("squat");
    const s = run(c, [...pushups, ...pushups]);
    expect(s.reps).toBe(0);
    expect(s.live).toBe("standUp");
  });

  it("does not count bending the arms without lowering the body", () => {
    // Plank position, but the shoulder stays at the same height (only the wrist moves).
    const frames = [...sweep(170, 70, 12), ...sweep(70, 170, 12)].map((a) => {
      const lm = pushupPose(170);
      const E = lm[LM.L_ELBOW], S = lm[LM.L_SHOULDER];
      const r = (a * Math.PI) / 180;
      const dx = S.x - E.x, dy = S.y - E.y; // rotate the elbow→shoulder vector to get the wrist
      lm[LM.L_WRIST] = { x: E.x + dx * Math.cos(r) - dy * Math.sin(r), y: E.y + dx * Math.sin(r) + dy * Math.cos(r), visibility: 0.99 };
      return lm;
    });
    const s = run(new RepCounter("pushup"), frames);
    expect(s.reps).toBe(0);
  });
});
