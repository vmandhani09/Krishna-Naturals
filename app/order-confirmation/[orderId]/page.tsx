import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Thank you! Your order is confirmed.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Order ID: <strong>{params.orderId}</strong></p>
          <p>Weve sent a confirmation to your email. You can track your order from your account.</p>
        </CardContent>
      </Card>
    </div>
  );
}


