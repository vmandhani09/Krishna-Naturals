import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/googleOAuth";

export async function GET() {
  const url = getGoogleAuthUrl();
  return NextResponse.redirect(url);
}


