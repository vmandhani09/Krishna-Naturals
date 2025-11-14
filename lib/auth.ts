// lib/auth.ts
import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

interface DecodedUser extends JwtPayload {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
}

export function extractToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("token")?.value || null;
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }

  return authHeader ?? cookieToken ?? null;
}

export function getCurrentUserType(req: NextRequest): {
  type: "user" | "local";
  user?: { _id: string; email: string; name?: string; role?: string };
} {
  const token = extractToken(req);

  if (!token) {
    return { type: "local" };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedUser;

    if (!decoded.userId || !decoded.email) {
      return { type: "local" };
    }

    return {
      type: "user",
      user: {
        _id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || "user",
      },
    };
  } catch (err) {
    return { type: "local" };
  }
}

export async function getCurrentUser(req: NextRequest): Promise<{
  _id: string;
  email: string;
  name?: string;
  role?: string;
} | null> {
  const currentUser = getCurrentUserType(req);

  if (currentUser.type === "user" && currentUser.user) {
    return currentUser.user;
  }

  return null;
}
