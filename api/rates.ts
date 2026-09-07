
let ratesCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export default async function handler(request: any, response: any) {
  const apiKey = process.env.EXCHANGERATE_API_KEY;
  const now = Date.now();

  // Return cached data if fresh
  if (ratesCache && (now - ratesCache.timestamp) < CACHE_TTL_MS) {
    return response.status(200).json(ratesCache.data);
  }

  const fallbackData = {
    rates: {
      USD: 3450,
      CNY: 480,
      EUR: 3750
    },
    updated: new Date().toISOString(),
    isMock: !apiKey
  };

  if (!apiKey) {
    ratesCache = { data: fallbackData, timestamp: now };
    return response.status(200).json(fallbackData);
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    if (!res.ok) throw new Error(`Rates fetch failed with status ${res.status}`);
    const data: any = await res.json();
    
    const result = {
      rates: {
        USD: Math.round(data.conversion_rates?.MNT) || 3450,
        CNY: 482,
        EUR: 3760
      },
      updated: new Date().toISOString(),
      isMock: false
    };

    ratesCache = { data: result, timestamp: now };
    return response.status(200).json(result);
  } catch (error) {
    console.warn('Rates fetch error, using fallback:', error);
    if (ratesCache) {
      return response.status(200).json(ratesCache.data);
    }
    return response.status(200).json(fallbackData);
  }
}

