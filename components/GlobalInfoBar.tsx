import React from 'react';
import { Cloud, Calendar, TrendingUp } from 'lucide-react';

export const GlobalInfoBar: React.FC = () => {
  // Date Logic
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDayNum = date.getDay();
  const weekDays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  const dateString = `${year} оны ${month} сарын ${day}, ${weekDays[weekDayNum]}`;

  return (
    <div className="bg-[#020617] bg-gradient-to-r from-[#020617] via-[#1e1b4b] to-[#020617] border-b border-white/5 relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between md:h-9">
          
          {/* Mobile Layout: Date on top, Weather/Currency below */}
          <div className="md:hidden w-full">
             {/* Line 1: Date */}
             <div className="flex justify-center py-1 border-b border-white/5">
                <span className="text-[10px] text-slate-400 font-medium">{dateString}</span>
             </div>
             {/* Line 2: Weather + Main Currency */}
             <div className="flex justify-between items-center py-1.5">
                {/* Weather */}
                <div className="flex items-center gap-2">
                   <Cloud size={12} className="text-sky-400" />
                   <span className="text-[10px] text-slate-300">Улаанбаатар</span>
                   <span className="text-[10px] font-bold text-white">-5°</span>
                </div>
                {/* Main Currency (Mobile Only) */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-green-400">USD</span>
                    <span className="text-[10px] text-white">3,450₮</span>
                </div>
             </div>
          </div>

          {/* Desktop Layout */}
          
          {/* Left: Weather */}
          <div className="hidden md:flex items-center gap-3">
             <div className="flex items-center gap-2 group cursor-default">
                <Cloud size={14} className="text-sky-400 group-hover:text-white transition-colors" />
                <span className="text-xs text-slate-300">Улаанбаатар</span>
                <span className="text-xs font-bold text-white">-5°</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider pl-1 border-l border-white/10 ml-1">Цаг агаар</span>
             </div>
          </div>

          {/* Center: Date */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium tracking-wide">
             <Calendar size={12} className="text-brand-purple/70" />
             <span>{dateString}</span>
          </div>

          {/* Right: Currency */}
          <div className="hidden md:flex items-center gap-2">
             <div className="flex items-center gap-1.5 mr-2">
                <TrendingUp size={12} className="text-brand-orange" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Валютын ханш</span>
             </div>
             
             <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 hover:border-green-500/30 hover:bg-green-500/10 transition-all group cursor-default">
                <span className="text-[10px] font-bold text-green-400 group-hover:text-green-300">USD</span>
                <span className="text-[10px] text-slate-200 group-hover:text-white">3,450₮</span>
             </div>

             <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group cursor-default">
                <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-300">CNY</span>
                <span className="text-[10px] text-slate-200 group-hover:text-white">480₮</span>
             </div>

             <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all group cursor-default">
                <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300">EUR</span>
                <span className="text-[10px] text-slate-200 group-hover:text-white">3,700₮</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};