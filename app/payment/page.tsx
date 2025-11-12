"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  const total = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const s = window.sessionStorage.getItem("checkout_pricing");
    if (!s) return 0;
    try { return JSON.parse(s)?.total || 0; } catch { return 0; }
  }, []);

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("orderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      toast.error("No order found");
      router.push("/checkout");
    }
  }, [router]);

  useEffect(() => {
    const initializePayment = async () => {
      if (!orderId) return;
      
      setInitializing(true);
      try {
        const res = await fetch('/api/payment/phonepe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();
        
        if (res.ok && data.success && data.redirectUrl) {
          setPaymentUrl(data.redirectUrl);
          setInitializing(false);
        } else {
          toast.error(data.error || 'Failed to initialize payment');
          setInitializing(false);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to initialize payment');
        setInitializing(false);
      }
    };

    if (orderId) {
      initializePayment();
    }
  }, [orderId]);

  const handlePayment = () => {
    if (paymentUrl) {
      setLoading(true);
      window.location.href = paymentUrl;
    } else {
      toast.error('Payment not ready');
    }
  };

  if (initializing) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-gray-600">Initializing payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Review & Pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Payment Gateway:</span> PhonePe
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Amount to Pay
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{total.toFixed(2)}
            </p>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={loading || !orderId || !paymentUrl} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              `Pay ₹${total.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            🔒 Secured by PhonePe Payment Gateway
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
