import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const flwSecretKey = process.env.FLW_SECRET_KEY;
  if (!flwSecretKey) {
    return NextResponse.json({ success: false, error: 'Flutterwave key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { account_number, account_bank } = body;

    if (!account_number || !account_bank) {
      return NextResponse.json({ success: false, error: 'account_number and account_bank are required' }, { status: 400 });
    }

    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flwSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_number, account_bank }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('FLW Resolve Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
