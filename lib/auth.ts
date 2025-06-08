// lib/auth.ts
import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

export function getCurrentUserType(req: NextRequest): {
  type: "user" | "local";
  user?: { _id: string; email: string };
} {
  const authHeader = req.headers.get("Authorization");
  const cookieToken = req.cookies.get("token")?.value;
  const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null);

  if (!token) return { type: "local" };

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    const userId = decoded.userId as string;
    const email = decoded.email as string;
    if (!userId || !email) return { type: "local" };
    return {
      type: "user",
      user: { _id: userId, email }
    };
  } catch {
    return { type: "local" };
  }
}
export async function getCurrentUser(req: NextRequest): Promise<{ _id: string; email: string } | null> {
  const currentUser = getCurrentUserType(req);
  if (currentUser.type === "user" && currentUser.user) {
    return currentUser.user;
  }
  return null;
}