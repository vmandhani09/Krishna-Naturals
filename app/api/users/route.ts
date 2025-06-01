import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

export async function GET() {
  try {
    await dbConnect(); // Ensure database connection

    const users = await User.find({ role: "user" }); // Fetch all users with role 'user'

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}