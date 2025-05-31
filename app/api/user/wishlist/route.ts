import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

// 📌 **GET: Fetch User's Wishlist**
export async function GET(req: NextRequest, context: { params: { userId: string } }) {
  try {
    await dbConnect();
    const { userId } = context.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 📌 **POST: Add Item to Wishlist**
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, sku } = await req.json();

    if (!userId || !sku) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.wishlist.includes(sku)) {
      user.wishlist.push(sku);
      await user.save();
    }

    return NextResponse.json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 📌 **DELETE: Remove Item from Wishlist**
export async function DELETE(req: NextRequest, context: { params: { userId: string; sku: string } }) {
  try {
    await dbConnect();
    const { userId, sku } = context.params;

    if (!userId || !sku) {
      return NextResponse.json({ error: "Missing userId or sku" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.wishlist = user.wishlist.filter((item: string) => item !== sku);
    await user.save();

    return NextResponse.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";
// import User from "@/lib/models/user";
// import Product from "@/lib/models/product"; // ✅ Import Product model for slug-based lookup

// // 📌 **GET: Fetch User's Wishlist with Product Details**
// export async function GET(req: NextRequest, context: { params: { userId: string } }) {
//   try {
//     await dbConnect();
//     const { userId } = context.params;

//     if (!userId) {
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     const user = await User.findById(userId);
//     if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     // ✅ Convert SKUs to full product details using `slug`
//     const wishlistProducts = await Product.find({ sku: { $in: user.wishlist } })
//       .select("name slug image category")
//       .lean();

//     return NextResponse.json({ wishlist: wishlistProducts });
//   } catch (error) {
//     console.error("❌ Error fetching wishlist:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // 📌 **POST: Add Item to Wishlist (Using Slug)**
// export async function POST(req: NextRequest) {
//   try {
//     await dbConnect();
//     const { userId, slug} = await req.json();

//     if (!userId || !slug) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // ✅ Find product by slug to get its SKU
    
//     const product = await Product.findOne({ slug }).select("sku").lean();
//     if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

//     const user = await User.findById(userId);
//     if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     if (!user.wishlist.includes(product.sku)) {
//       user.wishlist.push(product.sku);
//       await user.save();
//     }

//     return NextResponse.json({ message: "Added to wishlist", wishlist: user.wishlist });
//   } catch (error) {
//     console.error("❌ Error adding to wishlist:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // 📌 **DELETE: Remove Item from Wishlist (Using Slug)**
// export async function DELETE(req: NextRequest, context: { params: { userId: string; slug: string } }) {
//   try {
//     await dbConnect();
//     const { userId, slug } = context.params;

//     if (!userId || !slug) {
//       return NextResponse.json({ error: "Missing userId or slug" }, { status: 400 });
//     }

//     // ✅ Convert slug to SKU for removal
//     const product = await Product.findOne({ slug }).select("sku").lean();
//     if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

//     const user = await User.findById(userId);
//     if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     user.wishlist = user.wishlist.filter((item: string) => item !== product.sku);
//     await user.save();

//     return NextResponse.json({ message: "Removed from wishlist", wishlist: user.wishlist });
//   } catch (error) {
//     console.error("❌ Error removing wishlist item:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }