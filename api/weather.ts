
export default async function handler(request: any, response: any) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  // Express req has 'query' if using express.json() and standard route matching,
  // but let's be safe.
  const city = (request.query && request.query.city) || 'Ulaanbaatar';

  // Fallback mock data if no API key is present (prevents breaking in dev)
  if (!apiKey) {
    return response.status(200).json({
      temp: -15,
      condition: 'Clear',
      location: 'Ulaanbaatar (Mock)',
      isMock: true
    });
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!res.ok) throw new Error('Weather fetch failed');
    
    const data: any = await res.json();
    
    return response.status(200).json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      location: data.name,
      isMock: false
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch weather' });
  }
}
