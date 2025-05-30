import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";
import products from "@/lib/products"; // Ensure correct path

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch existing SKUs to prevent duplicates
    const existingSKUs = await Product.find().distinct("sku");
    const newProducts = products.filter(p => !existingSKUs.includes(p.sku));

    if (!newProducts.length) {
      return NextResponse.json({ error: "All products already exist" }, { status: 409 });
    }

    // Insert new products
    await Product.insertMany(newProducts);

    return NextResponse.json({ message: "Products stored successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error storing products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}