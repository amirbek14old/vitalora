import { NextResponse } from "next/server";
import { handlePayme, PAYME_PARSE_ERROR } from "@/lib/payments/payme";

export const dynamic = "force-dynamic";

/** Payme Merchant API endpoint (server-to-server; authenticated by Basic auth, not cookies). Always HTTP 200. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(PAYME_PARSE_ERROR());
  }
  return NextResponse.json(await handlePayme(body, req.headers.get("authorization")));
}
