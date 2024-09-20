"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon, CheckIcon } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "1,000 characters per month",
        "5 basic voices",
        "Standard audio quality",
        "Basic support",
      ],
    },
    {
      name: "Pro",
      price: "$19.99/month",
      features: [
        "100,000 characters per month",
        "100+ premium voices",
        "High-quality audio",
        "Priority support",
        "Voice cloning (1 voice)",
        "Talking image generation (10/month)",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited characters",
        "All premium voices",
        "Ultra-high quality audio",
        "24/7 dedicated support",
        "Unlimited voice cloning",
        "Unlimited talking image generation",
        "API access",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Pricing Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-2xl font-bold">{plan.price}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <Button className="mt-4">Choose Plan</Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-center space-x-8">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="text-sm">
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/credit">
            <Button variant="ghost" size="sm" className="text-sm">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Credit
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="sm" className="text-sm">
              <UserIcon className="h-4 w-4 mr-2" />
              Account
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}