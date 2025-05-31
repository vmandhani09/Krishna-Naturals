import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }

    const { name, email, mobile, password, confirmPassword, agreeToTerms } = body;

    // 🔍 Validate input
    if (!name || !email || !mobile || !password || !confirmPassword || agreeToTerms !== true) {
      return NextResponse.json({ error: "All fields are required, and you must agree to the terms" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // 🔍 Normalize email for case-insensitive check
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ error: "Email or mobile number is already in use" }, { status: 409 });
    }

    // 🔒 Hash password securely before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save new user instance with default cart
    const newUser = new User({ name, email: normalizedEmail, mobile, password: hashedPassword, cart: [] });
    await newUser.save();

    return NextResponse.json({ message: "Registration successful!" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}