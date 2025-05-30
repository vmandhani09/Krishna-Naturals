import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";
export async function GET(req: NextRequest, context: { params: { sku: string } }) {
  try {
    await dbConnect();
    
    const { sku } = context.params; // Correct way to access dynamic params

    if (!sku) {
      console.error("SKU is missing");
      return NextResponse.json({ error: "Missing SKU parameter" }, { status: 400 });
    }

    console.log("Fetching product with SKU:", sku);

    const product = await Product.findOne({ sku });

    if (!product) {
      console.error("Product not found:", sku);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest, { params }: { params: { sku: string } }) {
  try {
    await dbConnect();
    const updatedProduct = await Product.findOneAndUpdate({ sku: params.sku }, await req.json(), { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { sku: string } }) {
  try {
    await dbConnect();
    const deletedProduct = await Product.findOneAndDelete({ sku: params.sku });

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}