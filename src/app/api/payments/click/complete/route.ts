import { NextResponse } from "next/server";
import { clickComplete, readClickForm } from "@/lib/payments/click";

export const dynamic = "force-dynamic";

/** Click "Complete" callback (server-to-server; verified by md5 signature). */
export async function POST(req: Request) {
  return NextResponse.json(await clickComplete(await readClickForm(req)));
}
