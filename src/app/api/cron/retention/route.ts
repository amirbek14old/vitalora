import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runRetention } from "@/lib/retention";

export const dynamic = "force-dynamic";

// Called by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runRetention(db));
}
