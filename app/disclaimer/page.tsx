"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to TellerGen.com. These Terms and Conditions govern your use of our services, including our Text-to-Speech, Talking Image, and Voice Cloning services, as well as any related websites, applications, and APIs provided by TellerGen. By accessing or using our services, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please refrain from using our services.
          </p>

          <h3 className="text-xl font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing or using TellerGen services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy. These terms apply to all users, including visitors, registered users, and customers.
          </p>

          <h3 className="text-xl font-semibold">2. Eligibility</h3>
          <p>
            To use our services, you must be at least 18 years old or have the legal capacity to enter into a binding agreement. By using our services, you represent and warrant that you meet these eligibility requirements.
          </p>

          <h3 className="text-xl font-semibold">3. Account Registration</h3>
          <p>
            To access certain features of our services, you may be required to create an account. You agree to:
          </p>
          <ul className="list-disc list-inside">
            <li>Provide accurate and complete information during registration.</li>
            <li>Keep your account information up to date.</li>
            <li>Maintain the security of your account by keeping your password confidential.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>
          <p>
            You are responsible for all activities that occur under your account.
          </p>

          <h3 className="text-xl font-semibold">4. Use of Services</h3>
          <p>
            You agree to use TellerGen services in compliance with all applicable laws and regulations. You must not:
          </p>
          <ul className="list-disc list-inside">
            <li>Use our services for any unlawful or harmful activities.</li>
            <li>Upload, post, or transmit any content that infringes on the rights of others, including intellectual property rights.</li>
            <li>Misuse, interfere with, or disrupt the functionality of our services.</li>
            <li>Attempt to access or use another user's account without authorization.</li>
          </ul>

          <h3 className="text-xl font-semibold">5. Intellectual Property</h3>
          <p>
            All content, software, and technology provided by TellerGen, including text, graphics, logos, and trademarks, are the property of TellerGen or its licensors and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without our express written permission.
          </p>
          <p>
            You retain ownership of any content you submit to TellerGen, but you grant us a non-exclusive, royalty-free, worldwide license to use, reproduce, modify, and display such content for the purpose of providing our services.
          </p>

          <h3 className="text-xl font-semibold">6. Payment and Subscriptions</h3>
          <p>
            Certain TellerGen services are offered on a subscription basis or for a fee. You agree to:
          </p>
          <ul className="list-disc list-inside">
            <li>Pay all applicable fees and charges for the services you choose.</li>
            <li>Provide accurate and up-to-date payment information.</li>
            <li>Comply with any additional terms and conditions for subscription services.</li>
          </ul>
          <p>
            Failure to pay fees may result in the suspension or termination of your access to paid services.
          </p>

          <h3 className="text-xl font-semibold">7. Service Modifications and Termination</h3>
          <p>
            TellerGen reserves the right to modify, suspend, or terminate any part of our services at any time, with or without notice. We may also impose limits on certain features or restrict your access to parts or all of our services without liability.
          </p>
          <p>
            You may terminate your account and use of our services at any time by contacting us. Upon termination, your right to use the services will immediately cease, and any data associated with your account may be deleted.
          </p>

          <h3 className="text-xl font-semibold">8. Disclaimers</h3>
          <p>
            TellerGen services are provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or free from viruses or other harmful components.
          </p>
          <p>
            We disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h3 className="text-xl font-semibold">9. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, TellerGen and its affiliates, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, or goodwill, arising out of or related to your use of our services, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Our total liability to you for any claims arising from your use of our services shall not exceed the amount paid by you, if any, for accessing our services during the three (3) months preceding the event giving rise to the liability.
          </p>

          <h3 className="text-xl font-semibold">10. Indemnification</h3>
          <p>
            You agree to indemnify and hold harmless TellerGen, its affiliates, and their respective directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your use of our services, your violation of these Terms and Conditions, or your infringement of any rights of another person or entity.
          </p>

          <h3 className="text-xl font-semibold">11. Governing Law</h3>
          <p>
            These Terms and Conditions are governed by and construed in accordance with the laws of [Insert Jurisdiction], without regard to its conflict of law principles. Any disputes arising out of or related to these terms or our services shall be resolved exclusively in the courts of [Insert Jurisdiction].
          </p>

          <h3 className="text-xl font-semibold">12. Changes to Terms and Conditions</h3>
          <p>
            TellerGen reserves the right to update or modify these Terms and Conditions at any time. We will notify you of any significant changes by posting the updated terms on our website. Your continued use of our services after any such changes constitutes your acceptance of the new terms.
          </p>

          <h3 className="text-xl font-semibold">13. Contact Us</h3>
          <p>
            If you have any questions or concerns about these Terms and Conditions, please contact us at:
          </p>
          <p>
            Email: support@tellergen.com<br />
            Address: Ward no. 11, Baaikunthpur, Chhattisgaarh 497335<br />
            Phone: +91 9244039177
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