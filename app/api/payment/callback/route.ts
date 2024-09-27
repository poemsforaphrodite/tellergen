import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

// Define a mapping of base payment amounts (in rupees) to credits
const amountCreditsMap: { [key: number]: number } = {
  10: 1000,
  30: 4000,
  50: 7000,
  100: 12000,
  // Removed 499 from credits mapping
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

  // Initialize creditsToAdd
  let creditsToAdd: number | undefined;

  // Process the payment response
  try {
    if (code === 'PAYMENT_SUCCESS') {
      console.log('Payment successful');

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

      // Determine action based on the rounded base amount and product name
      if (roundedBaseAmount === 499) {
        const charactersToAdd = 1000000;

        if (transaction.status === 'completed') {
          console.log(`Transaction already processed: ${transactionId}`);
        } else {
          transaction.status = 'completed';
          
          // Check the product name to determine which feature to update
          const productName = transaction.productName || '';
          console.log(`Processing pro product: ${productName}`);

          if (productName.toLowerCase().includes('text_to_speech_pro')) {
            user.textToSpeechCharacters = (user.textToSpeechCharacters || 0) + charactersToAdd;
            console.log(`User Text-to-Speech characters updated: +${charactersToAdd} characters`);
          } else if (productName.toLowerCase().includes('voice_cloning_pro')) {
            user.voiceCloningCharacters = (user.voiceCloningCharacters || 0) + charactersToAdd;
            console.log(`User Voice Cloning characters updated: +${charactersToAdd} characters`);
          } else if (productName.toLowerCase().includes('talking_image_pro')) {
            user.talkingImageMinutes = (user.talkingImageMinutes || 0) + 100; // Assuming 100 minutes for Talking Image Pro
            console.log(`User Talking Image minutes updated: +100 minutes`);
          } else {
            console.warn(`Unrecognized pro product: ${productName}. Defaulting to Text-to-Speech Pro.`);
            user.textToSpeechCharacters = (user.textToSpeechCharacters || 0) + charactersToAdd;
            console.log(`User Text-to-Speech characters updated: +${charactersToAdd} characters`);
          }

          await user.save();
        }
      } else {
        // Handle standard credits addition (unchanged)
        creditsToAdd = amountCreditsMap[roundedBaseAmount];

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
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const creditUrl = new URL('/credit', baseUrl);
      creditUrl.searchParams.set('paymentSuccess', 'true');

      if (roundedBaseAmount === 499) {
        creditUrl.searchParams.set('characters', '1000000');
        creditUrl.searchParams.set('product', transaction.productName);
      } else {
        if (creditsToAdd === undefined) {
          console.error('creditsToAdd is undefined');
          return NextResponse.json(
            { error: 'Failed to determine credits to add' },
            { status: 500 }
          );
        }
        creditUrl.searchParams.set('credits', creditsToAdd.toString());
      }

      return Response.redirect(creditUrl.toString(), 303);
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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const failureUrl = new URL('/payment-failure', baseUrl);
  failureUrl.searchParams.set('reason', 'invalid_request_method');

  return Response.redirect(failureUrl.toString(), 303);
}
