import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, role: "admin" });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    // Set cookie in the response
    const response = NextResponse.json({ message: "Login successful!", token }, { status: 200 });
    response.cookies.set("adminToken", token, {
      httpOnly: true, // More secure, not accessible from JS
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
      sameSite: "lax", // Use 'lax' for better compatibility
    //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      secure: false, // Ensure secure flag is set
      // secure: process.env.NODE_ENV === "production", // Uncomment for production
    });
    console.log("Setting adminToken cookie:", response.cookies.get("adminToken"));
    console.log("API SECRET_KEY:", SECRET_KEY);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("adminToken")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; email: string; role: string };
    return NextResponse.json({ message: "Protected data", user: { id: decoded.userId, email: decoded.email } });
  } catch (err) {
    console.error("JWT verification failed:", err);
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}