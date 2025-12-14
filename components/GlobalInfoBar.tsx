
import React, { useEffect, useState } from 'react';
import { Cloud, Calendar, TrendingUp } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  isMock: boolean;
}

interface RateData {
  rates: {
    USD: number;
    CNY: number;
    EUR: number;
  };
  updated: string;
  isMock: boolean;
}

export const GlobalInfoBar: React.FC = () => {
  // Date Logic
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDayNum = date.getDay();
  const weekDays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  const dateString = `${year}.${month}.${day}, ${weekDays[weekDayNum]}`;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rates, setRates] = useState<RateData | null>(null);

  useEffect(() => {
    // Initial Fetch
    fetchWeather();
    fetchRates();

    // Poll Weather every 10 mins
    const weatherInterval = setInterval(fetchWeather, 600000);
    // Poll Rates every 30 mins
    const ratesInterval = setInterval(fetchRates, 1800000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(ratesInterval);
    };
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/weather?city=Ulaanbaatar');
      if (res.ok) setWeather(await res.json());
    } catch (e) {
      console.error('Weather widget error', e);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/rates');
      if (res.ok) setRates(await res.json());
    } catch (e) {
      console.error('Rate widget error', e);
    }
  };

  return (
    <div className="bg-surfaceHighlight/80 backdrop-blur-sm border-b border-border relative z-[60] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-8 text-[11px] md:text-xs text-text-muted font-medium">
          
          {/* Left: Weather */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 group cursor-default" title={weather?.isMock ? 'Demo Data' : 'Live Data'}>
                <Cloud size={12} className="text-sky-500" />
                <span>{weather ? weather.location : 'UB'}</span>
                {weather && <span className="font-bold text-text-main">{weather.temp}°</span>}
             </div>
             <div className="hidden md:block w-px h-3 bg-border"></div>
             <div className="hidden md:flex items-center gap-1.5">
                <Calendar size={12} className="text-brand-purple" />
                <span>{dateString}</span>
             </div>
          </div>

          {/* Right: Currency */}
          <div className="flex items-center gap-3">
             {/* Mobile: Date replaces rates if space is tight, but here we prioritize date on left for consistency */}
             
             {rates ? (
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1">
                    <span className="font-bold text-green-600">USD</span>
                    <span>{rates.rates.USD.toLocaleString()}₮</span>
                 </div>
                 <div className="hidden sm:flex items-center gap-1">
                    <span className="font-bold text-blue-600">CNY</span>
                    <span>{rates.rates.CNY.toLocaleString()}₮</span>
                 </div>
               </div>
             ) : (
                <span>Loading...</span>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
