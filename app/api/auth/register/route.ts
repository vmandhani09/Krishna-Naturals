import { dbConnect } from "@/lib/dbConnect";
import  User  from "@/lib/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, mobile, password, confirmPassword, agreeToTerms } = await req.json();

    // Validate input
    if (!name || !email || !mobile || !password || !confirmPassword || !agreeToTerms) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    return NextResponse.json({
      message: "Registration successful!",
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, mobile: newUser.mobile },
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}