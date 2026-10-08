import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";

type Node = string | number | boolean | Node[] | { [k: string]: Node };

function shape(node: Node, path = ""): string[] {
  if (Array.isArray(node)) return [`${path}[${node.length}]`, ...node.flatMap((n, i) => shape(n, `${path}[${i}]`))];
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  return [path];
}

function strings(node: Node): string[] {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node && typeof node === "object") return Object.values(node).flatMap(strings);
  return [];
}

describe("dictionaries", () => {
  it("uz and ru have exactly the same keys and list lengths as en", () => {
    expect(shape(uz as Node)).toEqual(shape(en as Node));
    expect(shape(ru as Node)).toEqual(shape(en as Node));
  });

  it("contain no empty strings", () => {
    for (const d of [en, uz, ru]) expect(strings(d as Node).filter((s) => !s.trim())).toEqual([]);
  });

  it("keep interpolation placeholders consistent", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    const e = strings(en as Node), u = strings(uz as Node), r = strings(ru as Node);
    e.forEach((s, i) => {
      expect(ph(u[i])).toBe(ph(s));
      expect(ph(r[i])).toBe(ph(s));
    });
  });

  it("Uzbek uses Latin script (no Cyrillic)", () => {
    expect(strings(uz as Node).filter((s) => /[Ѐ-ӿ]/.test(s))).toEqual([]);
  });
});
