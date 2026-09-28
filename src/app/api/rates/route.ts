import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get('base') || 'USD';
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch from ExchangeRate API');
    }

    const data = await res.json();

    // Filter to only the currencies Tradeafic supports (plus USD as base)
    const supportedCurrencies = ['NGN', 'KES', 'GHS', 'ZAR', 'XOF', 'UGX', 'USD'];
    const rates: Record<string, number> = {};
    
    for (const cur of supportedCurrencies) {
      if (data.conversion_rates[cur]) {
        rates[cur] = data.conversion_rates[cur];
      }
    }

    return NextResponse.json({
      success: true,
      base: data.base_code,
      rates: rates,
      timestamp: data.time_last_update_utc
    });
  } catch (error) {
    console.error('FX API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch rates' }, { status: 500 });
  }
}
