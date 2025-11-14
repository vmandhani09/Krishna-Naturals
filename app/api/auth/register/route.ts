import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cart: [],
    });

    const token = jwt.sign(
      { userId: newUser._id.toString(), name: newUser.name, email: newUser.email },
      SECRET_KEY,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        message: "Registration successful",
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 },
    );

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Secure; SameSite=Lax`,
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
