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
          <p>Effective Date: SEP 19, 2024</p>

          <h3 className="text-xl font-semibold">Introduction</h3>
          <p>
            This Privacy Policy describes how Martpuram ("we," "us," or "our") collects, uses, and discloses your information when you use our website <a href="https://tellergen.com/" className="text-blue-600 underline">https://tellergen.com/</a>. It also describes the choices you have associated with your information and how you can contact us.
          </p>

          <h3 className="text-xl font-semibold">Information We Collect</h3>
          <p>We collect several different types of information for various purposes to improve our services to you.</p>

          <h4 className="text-lg font-semibold">Personal Information</h4>
          <p>
            We may collect personal information, such as your name, email address, phone number, and billing address, when you:
          </p>
          <ul className="list-disc list-inside">
            <li>Create an account on our website</li>
            <li>Place an order</li>
            <li>Contact customer support</li>
            <li>Subscribe to our newsletter</li>
          </ul>

          <h4 className="text-lg font-semibold">Usage Data</h4>
          <p>
            We may also collect usage data, such as the pages you visit on our Website, the time you spend on those pages, the searches you conduct, and other information about your interaction with the Website. This data is collected automatically through cookies and similar technologies.
          </p>

          <h3 className="text-xl font-semibold">Use of Your Information</h3>
          <p>We use the information we collect for various purposes, including:</p>
          <ul className="list-disc list-inside">
            <li>To process your orders and provide you with the products you purchase</li>
            <li>To create and manage your account</li>
            <li>To send you marketing and promotional communications</li>
            <li>To personalize your experience on the Website</li>
            <li>To improve our Website and services</li>
            <li>To comply with legal and regulatory obligations</li>
          </ul>

          <h3 className="text-xl font-semibold">Sharing of Your Information</h3>
          <p>
            We may share your information with third-party service providers who help us operate our business and provide our services. These service providers are obligated to keep your information confidential and use it only for the purposes we have disclosed.
          </p>
          <p>
            We may also disclose your information if required to do so by law or in the good faith belief that such disclosure is necessary to:
          </p>
          <ul className="list-disc list-inside">
            <li>Comply with a legal process</li>
            <li>Protect the rights or safety of you or others</li>
            <li>Prevent fraud or other illegal activities</li>
          </ul>

          <h3 className="text-xl font-semibold">Data Retention</h3>
          <p>
            We will retain your information for as long as it is necessary for the purposes described in this Privacy Policy. We will also retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
          </p>

          <h3 className="text-xl font-semibold">Your Choices</h3>
          <p>You have several choices regarding your information:</p>
          <ul className="list-disc list-inside">
            <li>You can access and update your information in your account settings.</li>
            <li>You can opt out of receiving marketing and promotional communications from us by following the unsubscribe instructions in those communications.</li>
          </ul>

          <h3 className="text-xl font-semibold">Cookies and Similar Technologies</h3>
          <p>
            We use cookies and similar technologies to track the activity on our Website and hold certain information.
          </p>
          <p>
            Cookies are files with a small amount of data that may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Website.
          </p>

          <h3 className="text-xl font-semibold">Security</h3>
          <p>
            We take reasonable steps to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no website or internet transmission is completely secure. We cannot guarantee the security of your information.
          </p>

          <h3 className="text-xl font-semibold">Children's Privacy</h3>
          <p>
            Our Website is not directed to children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us. We will take steps to remove the information from our servers.
          </p>

          <h3 className="text-xl font-semibold">Changes to this Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
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