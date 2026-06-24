import React, { useState } from 'react';
import { 
  TrendingUp, Users, Eye, MessageSquare, Award, Clock, 
  Map, Laptop, Smartphone, Calendar, ChevronDown, Sparkles 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Mock Data for Analytics
const VISITOR_DATA = [
  { name: 'Даваа', visitors: 1240, views: 3100 },
  { name: 'Мягмар', visitors: 1450, views: 3450 },
  { name: 'Лхагва', visitors: 1680, views: 4200 },
  { name: 'Пүрэв', visitors: 1900, views: 4900 },
  { name: 'Баасан', visitors: 2200, views: 5800 },
  { name: 'Бямба', visitors: 2500, views: 6400 },
  { name: 'Ням', visitors: 2100, views: 5200 },
];

const ARTICLE_PERFORMANCE = [
  { name: 'Future of AI', views: 2450, comments: 124 },
  { name: 'Cyrillic History', views: 1890, comments: 85 },
  { name: 'Gobi Wildlife', views: 1620, comments: 42 },
  { name: 'Space Program', views: 1450, comments: 55 },
  { name: 'Tech In Ulaanbaatar', views: 1100, comments: 33 },
];

const TRAFFIC_SOURCES = [
  { name: 'Шууд (Direct)', value: 40, color: '#6366F1' },
  { name: 'Сошиал (Social)', value: 35, color: '#3B82F6' },
  { name: 'Хайлтын систем (SEO)', value: 18, color: '#10B981' },
  { name: 'Бусад холбоосууд', value: 7, color: '#F59E0B' },
];

const DEVICE_DATA = [
  { name: 'Гар утас (Mobile)', value: 72, color: '#10B981' },
  { name: 'Компьютер (Desktop)', value: 25, color: '#6366F1' },
  { name: 'Планшет (Tablet)', value: 3, color: '#F59E0B' },
];

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');

  return (
    <div className="space-y-6">
      {/* Top bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="text-brand-purple" />
            <span>Аналитик тайлан (Executive Analytics)</span>
          </h1>
          <p className="text-slate-400 text-sm">Вэбсайтын уншигчид, хандалтын тоо, нийтлэлийн үр өгөөжийг хянах нэгдсэн хянах самбар</p>
        </div>

        {/* Range select */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-[#131B2E]/60 border border-white/10 rounded-xl text-slate-300 text-xs font-semibold outline-none focus:border-brand-purple/50 transition-colors cursor-pointer"
          >
            <option value="7days">Сүүлийн 7 хоног</option>
            <option value="30days">Сүүлийн 30 хоног</option>
            <option value="90days">Сүүлийн 3 сар</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Widgets Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-brand-purple/20 transition-colors">
          <div className="p-3.5 bg-brand-purple/10 text-brand-purple rounded-xl">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Нийт хандалт (Views)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-mono">31,520</span>
              <span className="text-[10px] text-green-400 font-bold font-mono">+12.4%</span>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-brand-purple/20 transition-colors">
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Уншигчид (Visitors)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-mono">11,260</span>
              <span className="text-[10px] text-green-400 font-bold font-mono">+8.2%</span>
            </div>
          </div>
        </div>

        {/* Average reading duration */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-brand-purple/20 transition-colors">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Унших дундаж хугацаа</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-mono">4м 12с</span>
              <span className="text-[10px] text-green-400 font-bold font-mono">+3.5%</span>
            </div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-brand-purple/20 transition-colors">
          <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Идэвхтэй сэтгэгдэл</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-mono">312</span>
              <span className="text-[10px] text-green-400 font-bold font-mono">+15.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visitor Traffic Area Chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-[#131B2E]/30 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-white font-bold text-sm">Хандалтын өсөлтийн график (Уншигчид vs Нийт үзэлт)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VISITOR_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Нийт үзэлт" />
                <Area type="monotone" dataKey="visitors" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" name="Уншигч" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic channels Pie Chart (Right 1 col) */}
        <div className="bg-[#131B2E]/30 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3">Урсгалын сувгууд (Traffic Channels)</h3>
          
          <div className="h-44 relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TRAFFIC_SOURCES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {TRAFFIC_SOURCES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white">40%</span>
              <span className="text-[10px] text-slate-500">Шууд хандалт</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {TRAFFIC_SOURCES.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }}></span>
                  <span>{src.name}</span>
                </div>
                <span className="text-white font-bold font-mono">{src.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Article performance Bar Chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-[#131B2E]/30 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-sm">Топ нийтлэлүүдийн үзүүлэлт (Views & Comments)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ARTICLE_PERFORMANCE} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="views" fill="#6366F1" radius={[4, 4, 0, 0]} name="Үзсэн тоо" />
                <Bar dataKey="comments" fill="#10B981" radius={[4, 4, 0, 0]} name="Сэтгэгдэл" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device breakdown (Right 1 col) */}
        <div className="bg-[#131B2E]/30 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3">Төхөөрөмжүүдийн харьцаа</h3>

          <div className="space-y-5 my-auto">
            {DEVICE_DATA.map((dev, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    {dev.name.includes('Mobile') ? <Smartphone size={14} /> : <Laptop size={14} />}
                    {dev.name}
                  </span>
                  <span className="text-white font-bold font-mono">{dev.value}%</span>
                </div>
                {/* Bar */}
                <div className="w-full bg-[#0B0F19]/60 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${dev.value}%`, backgroundColor: dev.color }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex items-start gap-2.5 mt-2">
            <Sparkles className="text-brand-purple flex-shrink-0" size={16} />
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>AI дүгнэлт:</strong> Уншигчдын дийлэнх хэсэг буюу 72% нь ухаалаг утсаар хандаж байна. Нийтлэлийн зураг болон хэв маягийг гар утсанд хамгийн оновчтой байхаар нийтлэхийг зөвлөж байна.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
