import { NextResponse } from "next/server";
import { getSocialProofFeed } from "@/lib/social-proof";

export async function GET() {
  const feed = await getSocialProofFeed();
  return NextResponse.json({ feed });
}
