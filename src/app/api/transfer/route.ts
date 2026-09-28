import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the request body
    const body = await request.json();
    const { recipientId, senderCurrency, recipientCurrency, amount, fee } = body;

    if (!recipientId || !senderCurrency || !recipientCurrency || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate the credit amount based on the exchange rate 
    // (In production, this should fetch the live rate securely on the server)
    const mockRates: Record<string, number> = { 'NGN': 1500, 'KES': 130, 'GHS': 15, 'ZAR': 19, 'XOF': 600, 'UGX': 3800 };
    const rate = mockRates[recipientCurrency] / mockRates[senderCurrency];
    const creditAmount = amount * rate;

    // 3. Call the secure RPC function in Supabase
    const { data, error } = await supabase.rpc('process_transfer', {
      sender_id: user.id,
      recipient_id: recipientId,
      sender_currency: senderCurrency,
      recipient_currency: recipientCurrency,
      deduction_amount: amount,
      credit_amount: creditAmount,
      fee_amount: fee || (amount * 0.005) // Default 0.5% fee if not provided
    });

    if (error) {
      console.error('Transfer error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Transfer completed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
