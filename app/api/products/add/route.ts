import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const productData = await req.json();

    console.log("Received Data:", productData); // Log input data

    if (!productData.name || !productData.sku) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 409 });
    }

    const newProduct = await Product.create(productData);
    return NextResponse.json({ message: "Product added successfully", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}