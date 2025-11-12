import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com";

// Generate X-VERIFY header
function generateXVerify(base64Payload: string, saltKey: string, saltIndex: string): string {
  const stringToHash = base64Payload + `/pg/v1/pay` + saltKey;
  const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const finalString = sha256Hash + `###${saltIndex}`;
  return finalString;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!PHONEPE_SALT_KEY) {
      return NextResponse.json({ error: "PhonePe configuration error" }, { status: 500 });
    }

    const amount = Math.round((order.pricing?.total || 0) * 100); // Convert to paise
    const userId = order.userId?.toString() || "guest";
    const merchantTransactionId = orderId;

    // Construct callback URLs
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const redirectUrl = `${baseUrl}/payment-status`;
    const callbackUrl = `${baseUrl}/api/payment/phonepe/callback`;

    // Payment payload
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount,
      redirectUrl: redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl: callbackUrl,
      mobileNumber: order.shippingAddress?.phone || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Convert payload to base64
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Generate X-VERIFY header
    const xVerify = generateXVerify(base64Payload, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX);

    // Make API request to PhonePe
    const response = await fetch(`${PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PhonePe API error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // Decode the response
    if (data.response) {
      const responseData = JSON.parse(Buffer.from(data.response, "base64").toString());
      
      if (responseData.code === "PAYMENT_INITIATED" || responseData.code === "SUCCESS") {
        const redirectUrl = responseData.data?.instrumentResponse?.redirectInfo?.url;
        
        if (redirectUrl) {
          return NextResponse.json({
            success: true,
            redirectUrl: redirectUrl,
            merchantTransactionId: merchantTransactionId,
          });
        }
      }
    }

    console.error("PhonePe API response error:", data);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  } catch (error) {
    console.error("PhonePe payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

