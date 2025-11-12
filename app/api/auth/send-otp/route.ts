import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/lib/models/user';
import { sendEmail, generateOTP, getOTPEmailTemplate } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Generate OTP and send email
    const otp = generateOTP();
    const html = getOTPEmailTemplate(otp, user.name);
    const result = await sendEmail(user.email, 'Password Reset OTP - Dryfruit Grove', html);

    if (result) {
      // Return OTP to frontend (for frontend state validation)
      return NextResponse.json({ 
        success: true, 
        otp: otp
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to send OTP. Please try again.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

