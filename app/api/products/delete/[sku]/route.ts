import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function DELETE(req: NextRequest, { params }: { params: { sku: string } }) {
  try {
    await dbConnect();
    const { sku } = params;

    const deletedProduct = await Product.findOneAndDelete({ sku });
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}