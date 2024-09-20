"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Last updated: [Date]</p>
          
          <p>
            At TellerGen, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our services, including our Text-to-Speech, Talking Image, and Voice Cloning services, as well as any related websites, applications, and APIs.
          </p>

          <p>
            By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h3 className="text-xl font-semibold">1. Information We Collect</h3>
          <p>We collect different types of information to provide and improve our services to you. This includes:</p>
          <ul className="list-disc list-inside">
            <li>Personal Information (e.g., name, email address, billing information)</li>
            <li>Usage Data (e.g., IP address, browser type, pages visited)</li>
            <li>Voice and Media Data (e.g., uploaded text, images, or voice recordings)</li>
          </ul>

          <h3 className="text-xl font-semibold">2. How We Use Your Information</h3>
          <p>TellerGen uses the collected data for various purposes, including:</p>
          <ul className="list-disc list-inside">
            <li>To provide and maintain our services</li>
            <li>To notify you about changes to our services or policies</li>
            <li>To offer customer support and assist with service-related inquiries</li>
            <li>To improve the quality of our services</li>
            <li>To process transactions and manage billing</li>
            <li>To communicate with you regarding updates, promotions, or service-related information</li>
            <li>To comply with legal obligations and enforce our terms and conditions</li>
          </ul>

          {/* Add the rest of the privacy policy content here */}

          <h3 className="text-xl font-semibold">10. Contact Us</h3>
          <p>
            If you have any questions or concerns about this Privacy Policy or the handling of your personal data, please contact us at:
          </p>
          <p>
            Email: support@tellergen.com<br />
            Address: Ward no. 11, Baaikunthpur, Chhattisgaarh 497335<br />
            Phone: +91 9244039177
          </p>

          <p>Thank you for trusting TellerGen. Your privacy is important to us.</p>
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