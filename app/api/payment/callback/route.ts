import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { PRODUCTS } from '@/constants/products'; // Ensure importing PRODUCTS

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

      // Check the product name to determine which feature to update
      const productName = transaction.productName || '';
      console.log(`Processing product: "${productName}"`);

      const normalizedProductName = productName.trim().toLowerCase();
      console.log(`Normalized productName: "${normalizedProductName}"`);
      console.log(`Expected PRODUCTS.CREDITS_1000: "${PRODUCTS.CREDITS_1000.toLowerCase()}"`);

      const charactersToAdd = 1000000; // For Text-to-Speech Pro and Voice Cloning Pro

      if (productName === PRODUCTS.TEXT_TO_SPEECH_PRO) {
        // Calculate subscription end date (1 month from now)
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        
        // Update user's subscription status and end date
        await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              'subscriptions.textToSpeech': {
                active: true,
                endDate: subscriptionEndDate
              }
            }
          },
          { new: true }
        );
        
        console.log(`TTS Pro subscription activated until ${subscriptionEndDate}`);
      } else if (productName === PRODUCTS.VOICE_CLONING_PRO) {
        const charactersToAdd = 300000; // 300k characters
        user.voiceCloningCharacters = (user.voiceCloningCharacters || 0) + charactersToAdd;
        console.log(`User Voice Cloning characters updated: +${charactersToAdd} characters`);
      } else if (productName === PRODUCTS.TALKING_IMAGE_PRO) {
        user.talkingImageCharacters = (user.talkingImageCharacters || 0) + 360; // 360 seconds (6 minutes)
        console.log(`User Talking Image characters updated: +360 seconds`);
      } else if (normalizedProductName === PRODUCTS.CREDITS_1000.toLowerCase()) {
        creditsToAdd = 1000;
        console.log(`User received ${creditsToAdd} credits`);
      } else if (productName === PRODUCTS.CREDITS_4000) {
        creditsToAdd = 4000;
        console.log(`User received ${creditsToAdd} credits`);
      } else if (productName === PRODUCTS.CREDITS_7000) {
        creditsToAdd = 7000;
        console.log(`User received ${creditsToAdd} credits`);
      } else if (productName === PRODUCTS.CREDITS_12000) {
        creditsToAdd = 12000;
        console.log(`User received ${creditsToAdd} credits`);
      } else {
        console.warn(`Unrecognized product: "${productName}". Defaulting to Text-to-Speech Pro.`);
        user.textToSpeechCharacters = (user.textToSpeechCharacters || 0) + charactersToAdd;
        console.log(`User Text-to-Speech characters updated: +${charactersToAdd} characters`);
      }

      // Update credits if applicable
      if (creditsToAdd !== undefined) {
        user.credits = (user.credits || 0) + creditsToAdd;
        console.log(`User credits updated: +${creditsToAdd} credits`);
      }

      await user.save();

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const creditUrl = new URL('/credit', baseUrl);
      creditUrl.searchParams.set('paymentSuccess', 'true');

      if (roundedBaseAmount === 199 || roundedBaseAmount === 299) {
        creditUrl.searchParams.set('characters', roundedBaseAmount === 299 ? '360' : '300000');
        creditUrl.searchParams.set('product', transaction.productName);
      } else if (creditsToAdd !== undefined) {
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
