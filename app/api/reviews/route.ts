import { NextRequest, NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import Review from "@/lib/models/Review";
// 📌 **GET: Fetch Reviews for a Product**
export async function GET(req: NextRequest, context: { params: { productId: string } }) {
  try {
    await dbConnect();
    const { productId } = context.params;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ date: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// 📝 **POST: Add a Review to a Product**
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { productId, userId, userName, rating, comment } = await req.json();

    if (!productId || !userId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReview = await Review.create({
      productId,
      userId,
      userName,
      rating,
      comment,
      date: new Date(),
    });

    // Update Product's average rating
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRating / reviews.length;

    await productId.findByIdAndUpdate(productId, { averageRating });

    return NextResponse.json({ message: "Review added successfully!", review: newReview });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

