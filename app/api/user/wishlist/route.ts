import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import Product from "@/lib/models/product";
import { getCurrentUserType } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  await dbConnect();

  const { type, user } = getCurrentUserType(req);
  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productIds } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs array required" }, { status: 400 });
    }

    const validProducts = await Product.find({ _id: { $in: productIds } }).select("_id");
    const validProductIds = validProducts.map((p) => p._id);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { wishlist: { $each: validProductIds } } },
      { new: true }
    ).populate("wishlist");

    return NextResponse.json({ message: "Wishlist synced", wishlist: updatedUser?.wishlist });
  } catch (error) {
    console.error("Error syncing wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const { type, user } = getCurrentUserType(req);
  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const foundUser = await User.findById(user._id).populate("wishlist");

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: foundUser.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const { type, user } = getCurrentUserType(req);
  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { wishlist: product._id } },
      { new: true }
    ).populate("wishlist");

    return NextResponse.json({ message: "Added to wishlist", wishlist: updatedUser?.wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const { type, user } = getCurrentUserType(req);
  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json(); // ✅ Extract JSON body instead of query params
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate("wishlist");

    return NextResponse.json({ message: "Removed from wishlist", wishlist: updatedUser?.wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}