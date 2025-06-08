import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully!");

    // ✅ Fetch products from the database
    const products = await Product.find({});
    console.log("Fetched products:", products);

    return NextResponse.json(products.length ? products : { message: "No products found" });
  } catch (error: any) {
    console.error("Error fetching products:", error.message);
    
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}