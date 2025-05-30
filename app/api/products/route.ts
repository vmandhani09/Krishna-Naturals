import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json(products || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}