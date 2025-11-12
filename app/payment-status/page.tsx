'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/** 
 * Wrapper component for suspense-safe search param usage 
 */
function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantTransactionId = searchParams.get("merchantTransactionId");
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantTransactionId) {
      setStatus("failed");
      setLoading(false);
      return;
    }

    setOrderId(merchantTransactionId);

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(
          `/api/payment/phonepe/status?merchantTransactionId=${merchantTransactionId}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.status === "completed") {
          setStatus("success");
          toast.success("Payment successful!");

          // Clear session storage
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("checkout_shipping");
            sessionStorage.removeItem("checkout_pricing");
            sessionStorage.removeItem("orderId");
          }
        } else {
          setStatus("failed");
          toast.error(data.message || "Payment failed");
        }
      } catch (err: any) {
        console.error("Payment status check error:", err);
        setStatus("failed");
        toast.error("Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [merchantTransactionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center space-y-4">
            {loading || status === "checking" ? (
              <>
                <Loader2 className="h-16 w-16 text-emerald-600 animate-spin" />
                <h1 className="text-xl font-semibold text-gray-700">Verifying Payment...</h1>
                <p className="text-sm text-gray-500 text-center">
                  Please wait while we verify your payment
                </p>
              </>
            ) : status === "success" ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  Payment Successful!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Your payment has been processed successfully
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Order ID: {orderId}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <Button
                    onClick={() => router.push(`/order-confirmation/${orderId}`)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    View Order Details
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
                  Payment Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Your payment could not be processed. Please try again.
                </p>
                {orderId && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Order ID: {orderId}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-gray-600 mt-2">Loading payment status...</p>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
