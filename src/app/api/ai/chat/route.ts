import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** AI chat and food-photo analysis have been removed from VITALORA. */
export async function POST() {
  return NextResponse.json({ error: "removed" }, { status: 410 });
}
