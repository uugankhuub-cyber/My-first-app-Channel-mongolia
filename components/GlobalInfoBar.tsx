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
  const dateString = `${year} оны ${month} сарын ${day}, ${weekDays[weekDayNum]}`;

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
    <div className="bg-slate-50 dark:bg-[#020617] border-b border-gray-200 dark:border-white/5 relative z-[60] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between md:h-9">
          
          {/* Mobile Layout: Date on top, Weather/Currency below */}
          <div className="md:hidden w-full">
             {/* Line 1: Date */}
             <div className="flex justify-center py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{dateString}</span>
             </div>
             {/* Line 2: Weather + Main Currency */}
             <div className="flex justify-between items-center py-1.5">
                {/* Weather */}
                <div className="flex items-center gap-2">
                   <Cloud size={12} className="text-sky-500 dark:text-sky-400" />
                   <span className="text-[10px] text-slate-600 dark:text-slate-300">{weather ? weather.location : 'UB'}</span>
                   <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                      {weather ? `${weather.temp}°` : '...'}
                   </span>
                </div>
                {/* Main Currency (Mobile Only) */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400">USD</span>
                    <span className="text-[10px] text-slate-700 dark:text-white">
                      {rates ? rates.rates.USD.toLocaleString() : '...'}₮
                    </span>
                </div>
             </div>
          </div>

          {/* Desktop Layout */}
          
          {/* Left: Weather */}
          <div className="hidden md:flex items-center gap-3">
             <div className="flex items-center gap-2 group cursor-default" title={weather?.isMock ? 'Demo Data' : 'Live Data'}>
                <Cloud size={14} className="text-sky-500 dark:text-sky-400 group-hover:text-sky-600 dark:group-hover:text-white transition-colors" />
                <span className="text-xs text-slate-600 dark:text-slate-300">{weather ? weather.location : 'Loading...'}</span>
                {weather && <span className="text-xs font-bold text-slate-900 dark:text-white">{weather.temp}°</span>}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 border-l border-gray-200 dark:border-white/10 ml-1">Цаг агаар</span>
             </div>
          </div>

          {/* Center: Date */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
             <Calendar size={12} className="text-brand-purple" />
             <span>{dateString}</span>
          </div>

          {/* Right: Currency */}
          <div className="hidden md:flex items-center gap-2">
             <div className="flex items-center gap-1.5 mr-2">
                <TrendingUp size={12} className="text-brand-orange" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Валютын ханш</span>
             </div>
             
             {rates && (
               <>
                 <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-green-500/30 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group cursor-default">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">USD</span>
                    <span className="text-[10px] text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{rates.rates.USD.toLocaleString()}₮</span>
                 </div>

                 <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group cursor-default">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">CNY</span>
                    <span className="text-[10px] text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{rates.rates.CNY.toLocaleString()}₮</span>
                 </div>

                 <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group cursor-default">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">EUR</span>
                    <span className="text-[10px] text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{rates.rates.EUR.toLocaleString()}₮</span>
                 </div>
               </>
             )}
             {!rates && <span className="text-xs text-slate-500">Loading rates...</span>}
          </div>

        </div>
      </div>
    </div>
  );
};