import { NextResponse } from "next/server";
import { clickPrepare, readClickForm } from "@/lib/payments/click";

export const dynamic = "force-dynamic";

/** Click "Prepare" callback (server-to-server; verified by md5 signature). */
export async function POST(req: Request) {
  return NextResponse.json(await clickPrepare(await readClickForm(req)));
}
