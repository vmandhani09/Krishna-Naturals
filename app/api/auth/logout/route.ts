import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 🔥 Remove JWT Cookie
  const response = NextResponse.json({ message: "Logout successful!" });
  response.headers.set("Set-Cookie", "token=; HttpOnly; Path=/; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 UTC");

  return response;
}