import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

// Define a mapping of base payment amounts (in rupees) to credits
const amountCreditsMap: { [key: number]: number } = {
  10: 1000,
  30: 4000,
  50: 7000,
  100: 12000,
};

export async function POST(request: Request) {
  console.log('Payment callback received via POST');

  // Connect to the database
  try {
    await dbConnect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  // Parse the incoming data based on Content-Type
  const contentType = request.headers.get('content-type') || '';
  let responseData: any;

  if (contentType.includes('application/json')) {
    responseData = await request.json();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    responseData = Object.fromEntries(params.entries());
  } else {
    console.error('Unsupported content type:', contentType);
    return NextResponse.json(
      { error: 'Unsupported content type' },
      { status: 400 }
    );
  }

  console.log('Callback response:', responseData);

  // Destructure required fields from the response data
  const { merchantId, transactionId, amount, code } = responseData;

  // Ensure all required fields are present
  if (!merchantId || !transactionId || !amount || !code) {
    console.error('Missing required fields in callback response');
    return NextResponse.json(
      { error: 'Missing fields in response' },
      { status: 400 }
    );
  }

  // Convert amount from paisa to rupees
  const totalAmountInRupees = Number(amount) / 100;
  console.log(`Total amount (including GST): Rs${totalAmountInRupees.toFixed(2)}`);

  // Define GST rate
  const gstRate = 0.18;

  // Calculate base amount (excluding GST)
  const baseAmountInRupees = totalAmountInRupees / (1 + gstRate);
  // Round to nearest integer to match the keys in amountCreditsMap
  const roundedBaseAmount = Math.round(baseAmountInRupees);
  console.log(`Base amount (excluding GST): Rs${roundedBaseAmount}`);

  // Process the payment response
  try {
    if (code === 'PAYMENT_SUCCESS') {
      console.log('Payment successful');

      // Find the user based on transactionId
      const user = await User.findOne({ 'transactions.transactionId': transactionId });

      if (!user) {
        console.error(`User not found for transaction: ${transactionId}`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const transaction = user.transactions.find((tx: any) => tx.transactionId === transactionId);
      if (!transaction) {
        console.error(`Transaction not found: ${transactionId}`);
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      // Determine credits to add based on the base amount
      const creditsToAdd = amountCreditsMap[roundedBaseAmount];

      if (!creditsToAdd) {
        console.error(`Invalid payment amount received: Rs${totalAmountInRupees}`);
        return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
      }

      // Check if the transaction has already been processed
      if (transaction.status === 'completed') {
        console.log(`Transaction already processed: ${transactionId}`);
      } else {
        // Update transaction status
        transaction.status = 'completed';
        // Add credits directly to the user's account
        user.credits += creditsToAdd;

        await user.save();

        console.log(`User credits updated: +${creditsToAdd} credits`);
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      console.log(process.env.NEXT_PUBLIC_BASE_URL)
      const successUrl = new URL('/payment-success', baseUrl);
      successUrl.searchParams.set('credits', creditsToAdd.toString());

      // Redirect to the payment success page
      return Response.redirect(successUrl.toString(), 303);
    } else {
      console.log('Payment failed with code:', code);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const failureUrl = new URL('/payment-failure', baseUrl);
      failureUrl.searchParams.set('reason', code);

      // Redirect to the payment failure page
      return Response.redirect(failureUrl.toString(), 303);
    }
  } catch (error: any) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Update the GET function as well
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const failureUrl = new URL('/payment-failure', baseUrl);
  failureUrl.searchParams.set('reason', 'invalid_request_method');

  return Response.redirect(failureUrl.toString(), 303);
}
