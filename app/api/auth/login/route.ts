import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 🔍 Normalize email for case-insensitive lookup
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 🔒 Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 🔑 Generate JWT token with secure error handling
    let token;
    try {
      token = jwt.sign({ userId: user._id.toString(), email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    } catch (error) {
      console.error("JWT generation error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // ✅ Securely store token in HttpOnly cookie
    const response = NextResponse.json({
      message: "Login successful!",
      token,
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Secure; SameSite=Lax`
    );

    // 🔄 Force Header Refresh in Frontend
    response.headers.set("X-Auth-Refresh", Date.now().toString());

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}