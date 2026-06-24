
export default async function handler(request: any, response: any) {
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    return response.status(200).json({
      rates: {
        USD: 3450,
        CNY: 480,
        EUR: 3750
      },
      updated: new Date().toISOString(),
      isMock: true
    });
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    if (!res.ok) throw new Error('Rates fetch failed');
    const data: any = await res.json();
    
    return response.status(200).json({
      rates: {
        USD: Math.round(data.conversion_rates.MNT) || 3450,
        CNY: 482,
        EUR: 3760
      },
      updated: new Date().toISOString(),
      isMock: false
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch rates' });
  }
}
