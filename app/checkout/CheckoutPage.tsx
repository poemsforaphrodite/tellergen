"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PRODUCTS } from '@/constants/products'; // Importing product constants

export default function CheckoutPage() {
  const [product, setProduct] = useState<{ name: string; price: number; credits?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (searchParams) {
      const productQueryName = searchParams.get('product');
      const productPrice = searchParams.get('price');

      if (productQueryName && productPrice) {
        // Map the query parameter to the defined constants
        let mappedProductName = '';

        if (productQueryName.toLowerCase().includes('text_to_speech_pro')) {
          mappedProductName = PRODUCTS.TEXT_TO_SPEECH_PRO;
        } else if (productQueryName.toLowerCase().includes('voice_cloning_pro')) {
          mappedProductName = PRODUCTS.VOICE_CLONING_PRO;
        } else if (productQueryName.toLowerCase().includes('talking_image_pro')) {
          mappedProductName = PRODUCTS.TALKING_IMAGE_PRO;
        } else if (productQueryName.toLowerCase().endsWith('_credits')) {
          // Handle credit-based products
          mappedProductName = productQueryName.toLowerCase();
        } else {
          setError('Invalid product selection');
          setLoading(false);
          return;
        }

        const subtotal = parseFloat(productPrice) || 0;
        const calculatedGst = parseFloat((subtotal * 0.18).toFixed(2));
        const calculatedTotal = parseFloat((subtotal + calculatedGst).toFixed(2));
        setTotal(calculatedTotal);

        // Determine if the product is a Pro Plan or Credits
        const isProPlan = mappedProductName.includes('_pro');
        let creditsValue: number | undefined = undefined;

        if (isProPlan) {
          // For Pro Plans, set credits to 0 explicitly
          creditsValue = 0;
        } else if (mappedProductName.endsWith('_credits')) {
          // Extract the number of credits from the product name
          const creditsMatch = mappedProductName.match(/^(\d+)_credits$/);
          if (creditsMatch && creditsMatch[1]) {
            creditsValue = parseInt(creditsMatch[1], 10);
          } else {
            setError('Invalid credits product');
            setLoading(false);
            return;
          }
        }

        setProduct({
          name: mappedProductName,
          price: subtotal,
          credits: creditsValue,
        });
      } else {
        setError('Invalid product selection');
      }
      setLoading(false);
    } else {
      setLoading(false);
      setError('Invalid product selection');
    }
  }, [searchParams]);

  const generatePaymentUrl = async () => {
    setLoading(true);
    try {
      const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const creditsValue = product?.credits ?? 0;

      const payload: any = {
        merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: "MUID" + Date.now(),
        amount: Math.round(total * 100), // Convert to paise and ensure it's an integer
        redirectUrl: `${window.location.origin}/api/payment/callback`,
        redirectMode: "POST", // Changed to 'POST' to match backend
        callbackUrl: `${window.location.origin}/api/payment/callback`,
        mobileNumber: phone.replace(/\s+/g, ''), // Remove spaces from phone number
        paymentInstrument: {
          type: "PAY_PAGE",
        },
        credits: creditsValue,
        productName: product?.name, // Ensuring correct product name is sent
      };

      console.log('Payload:', payload);

      const base64Payload = btoa(JSON.stringify(payload));

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: base64Payload,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setError(null);
    setSuccess(null);

    if (!fullName || !phone || !email) {
      setError('Please fill in all required fields');
      return;
    }

    await generatePaymentUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert variant="destructive">
          <AlertDescription>Invalid product selection</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error && (
            <Alert variant="destructive" className="rounded-md">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-100 border-green-400 text-green-700 rounded-md">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            <div className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Product:</span>
                <span className="font-medium">
                  {product.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Price:</span>
                <span className="font-medium">₹{product.price.toFixed(2)}</span>
              </div>
              {product.credits !== undefined && product.credits !== 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Credits:</span>
                  <span className="font-medium">{product.credits.toLocaleString()}</span>
                </div>
              )}
              {product.credits === 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Features:</span>
                  <span className="font-medium">Unlimited Usage</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">GST (18%):</span>
                <span className="font-medium">₹{(product.price * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Billing Details</h2>
            <div className="flex flex-col">
              <Label htmlFor="fullName" className="mb-1 text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="phone" className="mb-1 text-gray-700">
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Enter your phone number"
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="email" className="mb-1 text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Checkout Button */}
          <div className="mt-6">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 text-center p-4 rounded-b-lg">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
