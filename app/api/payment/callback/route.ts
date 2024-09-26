import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

// Define a mapping of base payment amounts (in rupees) to credits
const amountCreditsMap: { [key: number]: number } = {
  99: 50000,
  249: 200000,
  499: 500000,
  799: 1000000,
  1299: 2000000,
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

      if (transaction.status !== 'pending') {
        console.error(`Transaction already processed: ${transactionId}`);
        return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
      }

      // Determine credits to add based on the base amount
      const creditsToAdd = amountCreditsMap[roundedBaseAmount];

      if (!creditsToAdd) {
        console.error(`Invalid payment amount received: Rs${totalAmountInRupees}`);
        return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
      }

      // Update transaction status
      transaction.status = 'completed';
      // Add credits directly to the user's account
      user.credits += creditsToAdd;

      await user.save();

      console.log(`User credits updated: +${creditsToAdd} credits`);

      // Derive the base URL from the incoming request
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      // Redirect to the payment success page
      return NextResponse.redirect(
        `${baseUrl}/payment-success?credits=${creditsToAdd}`
      );
    } else {
      console.log('Payment failed with code:', code);

      // Derive the base URL from the incoming request
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;

      // Redirect to the payment failure page
      return NextResponse.redirect(
        `${baseUrl}/payment-failure?reason=${code}`
      );
    }
  } catch (error: any) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests if necessary
export async function GET(request: Request) {
  // Derive the base URL from the incoming request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return NextResponse.redirect(
    `${baseUrl}/payment-failure?reason=invalid_request_method`
  );
}
