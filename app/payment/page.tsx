"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const total = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const s = window.sessionStorage.getItem("checkout_pricing");
    if (!s) return 0;
    try { return JSON.parse(s)?.total || 0; } catch { return 0; }
  }, []);

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("orderId");
    if (storedOrderId) setOrderId(storedOrderId);
  }, []);

  const onPay = async () => {
    if (!stripe || !elements || !orderId) return;
    setLoading(true);
    try {
      const ciRes = await fetch("/api/payment/create-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const { clientSecret, error } = await ciRes.json();
      if (!ciRes.ok || !clientSecret) throw new Error(error || "Failed to init payment");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (stripeError) throw stripeError;

      const verifyRes = await fetch("/api/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentIntentId: paymentIntent?.id, orderId }) });
      const verify = await verifyRes.json();
      if (!verifyRes.ok || !verify.success) throw new Error("Verification failed");

      sessionStorage.removeItem("checkout_shipping");
      sessionStorage.removeItem("checkout_pricing");
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      alert(err.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Review & Pay</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded border">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        <Button onClick={onPay} disabled={loading || !orderId} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? "Processing..." : `Pay ₹${total}`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PaymentPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}


