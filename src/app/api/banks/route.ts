import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ success: false, error: 'Country code is required' }, { status: 400 });
  }

  const flwSecretKey = process.env.FLW_SECRET_KEY;
  if (!flwSecretKey) {
    return NextResponse.json({ success: false, error: 'Flutterwave key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.flutterwave.com/v3/banks/${country}`, {
      headers: {
        'Authorization': `Bearer ${flwSecretKey}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('FLW Fetch Banks Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
