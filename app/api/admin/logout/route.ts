import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("adminToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // Expire immediately
    sameSite: "lax",
    secure: false, // Set to true in production with HTTPS
  });
  return response;
}