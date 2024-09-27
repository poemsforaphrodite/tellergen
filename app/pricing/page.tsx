"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon, CheckIcon } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  const plans = [
    {
      title: "TellerGen Text to Speech Pro",
      price: 499,
      features: [
        "100+ Premium and Celebrity voices",
        "High quality audio download",
        "Ultra realistic voices",
        "1 million characters"
      ]
    },
    {
      title: "TellerGen Voice Cloning Pro",
      price: 499,
      features: [
        "Clone up to 1 million characters",
        "High quality audio",
        "Ultra realistic cloned voice",
        "Fast processing"
      ]
    },
    {
      title: "TellerGen Talking Image Pro",
      price: 799,
      features: [
        "Up to 1000 minutes of video generation",
        "High quality image to video",
        "Realistic head movement",
        "Perfect lip syncing"
      ]
    },
    {
      title: "TellerGen Combo Pack",
      price: 999,
      features: [
        "Text to Speech Pro",
        "Voice Cloning Pro",
        "Talking Image Pro",
        "Best value for all features"
      ]
    }
  ]

  const handleBuyPro = (product: string, price: number) => {
    router.push(`/checkout?product=${product.toLowerCase().replace(/\s+/g, '_')}&price=${price}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-6xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800 text-center">Our Pro Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md space-y-4 border border-indigo-100 hover:border-indigo-300 transition-all duration-300">
                <h3 className="text-xl font-semibold text-indigo-800">{plan.title}</h3>
                <p className="text-3xl font-bold text-indigo-600">Rs {plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleBuyPro(plan.title, plan.price)} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                >
                  {plan.title === "TellerGen Combo Pack" ? "Buy Combo" : "Buy Pro"}
                </Button>
              </div>
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