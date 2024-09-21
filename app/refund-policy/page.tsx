"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Refund Policy - TellerGen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Thank you for choosing TellerGen. We strive to provide high-quality voice services, including Text-to-Speech, Talking Image, and Voice Cloning. Before making a purchase, we encourage you to fully evaluate our services to ensure they meet your needs.
          </p>

          <h3 className="text-xl font-semibold">No Refund Policy</h3>
          <p>
            All purchases made on TellerGen.com are final and non-refundable.
          </p>
          <p>
            Due to the nature of digital services and the immediate delivery of our products, we do not offer refunds or credits for any fees or charges, including but not limited to:
          </p>
          <ul className="list-disc list-inside">
            <li>Subscription fees</li>
            <li>Usage fees</li>
            <li>One-time service charges</li>
          </ul>
          <p>
            This policy applies to all customers, regardless of usage or satisfaction with the service.
          </p>

          <h3 className="text-xl font-semibold">Exceptions</h3>
          <p>
            In rare cases, we may consider refunds under specific circumstances, such as:
          </p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Technical Errors:</strong> If a technical error caused by TellerGen prevents you from accessing the service you purchased, we will review the issue and may offer a resolution at our discretion.
            </li>
            <li>
              <strong>Duplicate Charges:</strong> If you were mistakenly charged more than once for the same service, please contact us, and we will review and process a refund for the duplicate charges.
            </li>
          </ul>
          <p>
            To request a review of your case, please contact us at support@tellergen.com within 14 days of your purchase. Include your account details, transaction ID, and a description of the issue.
          </p>

          <h3 className="text-xl font-semibold">Service Cancellation</h3>
          <p>
            You may cancel your subscription or service at any time, but you will not receive a refund for any remaining period of your subscription or for any unused services. Your access to the service will continue until the end of your current billing cycle.
          </p>

          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p>
            If you have any questions or concerns about our Refund Policy, please reach out to us:
          </p>
          <p>
            Email: support@tellergen.com<br />
            Address: Ward no. 11, Baaikunthpur, Chhattisgaarh 497335<br />
            Phone: +91 9244039177
          </p>

          <p>
            We appreciate your understanding and thank you for choosing TellerGen.
          </p>
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