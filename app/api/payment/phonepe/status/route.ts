import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";

// Generate X-VERIFY header for status check
function generateXVerifyStatus(merchantId: string, merchantTransactionId: string, saltKey: string, saltIndex: string): string {
  const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
  const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const finalString = sha256Hash + `###${saltIndex}`;
  return finalString;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const merchantTransactionId = searchParams.get("merchantTransactionId");

    if (!merchantTransactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    if (!PHONEPE_SALT_KEY) {
      return NextResponse.json({ error: "PhonePe configuration error" }, { status: 500 });
    }

    // Generate X-VERIFY header
    const xVerify = generateXVerifyStatus(PHONEPE_MERCHANT_ID, merchantTransactionId, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX);

    // Check payment status with PhonePe
    const response = await fetch(
      `${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { error: data.message || "Failed to check payment status" },
        { status: 500 }
      );
    }

    // Decode the response
    const responseData = JSON.parse(Buffer.from(data.response, "base64").toString());
    const { code, data: paymentData } = responseData;

    // Update order status in database
    if (code === "PAYMENT_SUCCESS" && paymentData.state === "COMPLETED") {
      await Order.updateOne(
        { orderId: merchantTransactionId },
        {
          $set: {
            paymentStatus: "completed",
            orderStatus: "confirmed",
            "paymentDetails.method": "phonepe",
            "paymentDetails.transactionId": paymentData.transactionId,
            "paymentDetails.status": "completed",
            "paymentDetails.response": responseData,
          },
        }
      );

      return NextResponse.json({
        success: true,
        status: "completed",
        transactionId: paymentData.transactionId,
      });
    }

    // Payment failed
    await Order.updateOne(
      { orderId: merchantTransactionId },
      {
        $set: {
          paymentStatus: "failed",
          "paymentDetails.method": "phonepe",
          "paymentDetails.status": "failed",
          "paymentDetails.response": responseData,
        },
      }
    );

    return NextResponse.json({
      success: false,
      status: "failed",
      message: paymentData.responseCode || "Payment failed",
    });
  } catch (error) {
    console.error("PhonePe status check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

