import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }

    const { name, email, password, confirmPassword, agreeToTerms } = body;

    // 🔍 Validate input
    if (!name || !email || !password || !confirmPassword || agreeToTerms !== true) {
      return NextResponse.json({ error: "All fields are required, and you must agree to the terms" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // 🔍 Normalize email for case-insensitive check
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    // 🔒 Hash password securely before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔑 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // ✅ Save new user instance with default cart and verification token
    const newUser = new User({ 
      name, 
      email: normalizedEmail, 
      password: hashedPassword, 
      cart: [],
      isVerified: false,
      verificationToken,
      authProvider: "local"
    });
    await newUser.save();

    // 📧 Send verification email
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
    const html = getVerificationEmailTemplate(verificationLink, name);
    const emailSent = await sendEmail(normalizedEmail, "Verify Your Email - Dryfruit Grove", html);

    if (!emailSent) {
      console.error("Failed to send verification email");
      // Still return success, but log the error
    }

    return NextResponse.json({ 
      success: true,
      message: "Registration successful! Please check your email to verify your account." 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}