// app/api/products/by-ids/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/lib/models/product";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ products: [] });
    }
    const products = await Product.find({ _id: { $in: ids } }).lean();

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error("Error in /api/products/by-ids:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}