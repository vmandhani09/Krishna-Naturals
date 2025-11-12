import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const host = req.headers.get("host") || "localhost:3000";
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
      return NextResponse.redirect(`${baseUrl}/auth/login?error=invalid_token`);
    }

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=invalid_token`);
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=already_verified`);
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined; // Clear token after verification
    await user.save();

    // Redirect to login with success message
    return NextResponse.redirect(`${baseUrl}/auth/login?verified=true`);
  } catch (error) {
    console.error("Email verification error:", error);
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    return NextResponse.redirect(`${baseUrl}/auth/login?error=verification_failed`);
  }
}

