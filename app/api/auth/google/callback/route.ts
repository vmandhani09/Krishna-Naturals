import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, fetchGoogleUser } from "@/lib/googleOAuth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`/auth/login?error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return NextResponse.redirect("/auth/login?error=missing_code");
    }

    const tokens = await exchangeCodeForTokens(code);
    const google = await fetchGoogleUser(tokens.access_token);

    await dbConnect();
    const email = google.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: google.name,
        email,
        avatar: google.picture,
        googleId: google.id,
        authProvider: "google",
        cart: [],
      });
    } else {
      let changed = false;
      if (!user.googleId) { user.googleId = google.id; changed = true; }
      if (!user.avatar && google.picture) { user.avatar = google.picture; changed = true; }
      if (user.authProvider !== "google" && !user.password) { user.authProvider = "google"; changed = true; }
      if (changed) await user.save();
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email, name: user.name }, SECRET_KEY, { expiresIn: "7d" });
    const res = NextResponse.redirect("/home");
    res.headers.set("Set-Cookie", `token=${token}; HttpOnly; Path=/; Secure; SameSite=Lax`);
    res.headers.set("X-Auth-Refresh", Date.now().toString());
    return res;
  } catch (err) {
    return NextResponse.redirect("/auth/login?error=google_auth_failed");
  }
}


