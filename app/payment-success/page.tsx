"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const credits = searchParams?.get('credits') || '0'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-4">{credits} credits have been added to your account.</p>
        <Link href="/home" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  )
}