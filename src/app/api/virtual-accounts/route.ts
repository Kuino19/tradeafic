import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, amount, narration, bvn } = await req.json();

    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET_KEY) {
      return NextResponse.json({ error: 'Missing Flutterwave Secret Key' }, { status: 500 });
    }

    const tx_ref = `tradeafic_v_acc_${Date.now()}`;

    // For temporary accounts, amount is technically optional in some countries but required in others.
    // If not provided, we omit it so any amount can be transferred.
    const payload: any = {
      email,
      is_permanent: false,
      tx_ref,
      narration: narration || 'Wallet Funding'
    };
    
    if (amount) payload.amount = amount;
    if (bvn) payload.bvn = bvn;

    const response = await fetch('https://api.flutterwave.com/v3/virtual-account-numbers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Flutterwave Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
