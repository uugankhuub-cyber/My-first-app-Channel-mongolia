
let weatherCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(request: any, response: any) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = (request.query && request.query.city) || 'Ulaanbaatar';

  // Return cached data if valid
  const now = Date.now();
  if (weatherCache && (now - weatherCache.timestamp) < CACHE_TTL_MS) {
    return response.status(200).json(weatherCache.data);
  }

  // Fallback data if no API key is present or on failure
  const fallbackData = {
    temp: -4,
    condition: 'Clear',
    location: 'Улаанбаатар',
    isMock: !apiKey
  };

  if (!apiKey) {
    weatherCache = { data: fallbackData, timestamp: now };
    return response.status(200).json(fallbackData);
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!res.ok) throw new Error(`Weather fetch failed with status ${res.status}`);
    
    const data: any = await res.json();
    const result = {
      temp: Math.round(data.main?.temp ?? 0),
      condition: data.weather?.[0]?.main || 'Clear',
      location: data.name || 'Улаанбаатар',
      isMock: false
    };

    weatherCache = { data: result, timestamp: now };
    return response.status(200).json(result);
  } catch (error) {
    console.warn('Weather fetch error, using fallback:', error);
    // If we have any previous cache, return it even if expired
    if (weatherCache) {
      return response.status(200).json(weatherCache.data);
    }
    return response.status(200).json(fallbackData);
  }
}

