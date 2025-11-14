import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family:sans-serif;">
        <h2>Your OTP for Dryfruit Grove</h2>
        <p>Use this OTP to verify your email: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `;

    const emailSent = await sendEmail(email, "Dryfruit Grove - Verify your Email", html);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending registration OTP:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
