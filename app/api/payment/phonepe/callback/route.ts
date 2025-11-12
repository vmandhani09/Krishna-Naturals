import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

// Verify X-VERIFY header
function verifyXVerify(base64Response: string, xVerifyHeader: string, saltKey: string, saltIndex: string): boolean {
  const stringToHash = base64Response + `/pg/v1/status/{merchantId}/{merchantTransactionId}` + saltKey;
  const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const finalString = sha256Hash + `###${saltIndex}`;
  return finalString === xVerifyHeader;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    
    // PhonePe sends callback with response and X-VERIFY
    const base64Response = body.response || body.data?.response;
    const xVerify = req.headers.get("x-verify") || body.xVerify;

    if (!base64Response) {
      console.error("No response in callback");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify the callback if xVerify is provided
    if (xVerify && !verifyXVerify(base64Response, xVerify, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX)) {
      console.error("Verification failed");
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    // Decode the response
    const responseData = JSON.parse(Buffer.from(base64Response, "base64").toString());
    const { code, data } = responseData;

    if (!data || !data.merchantTransactionId) {
      console.error("Invalid response data");
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    const merchantTransactionId = data.merchantTransactionId;

    if (code === "PAYMENT_SUCCESS" && data.state === "COMPLETED") {
      // Update order status
      await Order.updateOne(
        { orderId: merchantTransactionId },
        {
          $set: {
            paymentStatus: "completed",
            orderStatus: "confirmed",
            "paymentDetails.method": "phonepe",
            "paymentDetails.transactionId": data.transactionId,
            "paymentDetails.status": "completed",
            "paymentDetails.response": responseData,
          },
        }
      );

      return NextResponse.json({ success: true, message: "Payment verified" });
    }

    // Payment failed or pending
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

    return NextResponse.json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.error("PhonePe callback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

