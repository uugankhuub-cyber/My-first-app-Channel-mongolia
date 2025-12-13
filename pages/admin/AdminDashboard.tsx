import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BarChart3, FileText, CheckCircle, Clock, Sparkles } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminContent, feedbackSummary, aiSuggestions } = useAdmin();

  const publishedCount = adminContent.filter(c => c.status === 'published').length;
  const draftCount = adminContent.filter(c => c.status === 'draft').length;
  const activeSuggestions = aiSuggestions.filter(s => !s.isUsed).length;

  const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Хянах самбар</h1>
        <p className="text-slate-400">Өнөөдрийн байдлаарх контент болон системийн тойм</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
           label="Нийтлэгдсэн" 
           value={publishedCount} 
           icon={<CheckCircle className="text-green-500" />} 
           color="bg-green-500" 
        />
        <StatCard 
           label="Ноорог" 
           value={draftCount} 
           icon={<FileText className="text-yellow-500" />} 
           color="bg-yellow-500" 
        />
        <StatCard 
           label="AI Санал" 
           value={activeSuggestions} 
           icon={<Sparkles className="text-brand-purple" />} 
           color="bg-brand-purple" 
        />
        <StatCard 
           label="Нийт үнэлгээ" 
           value={feedbackSummary.totalRatings} 
           icon={<BarChart3 className="text-brand-orange" />} 
           color="bg-brand-orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Recent Activity / Content */}
         <div className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
               <h3 className="font-bold text-white">Сүүлд нийтэлсэн</h3>
            </div>
            <div className="divide-y divide-white/5">
               {adminContent.filter(c => c.status === 'published').slice(0, 5).map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                     <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                           <span>{item.category}</span>
                           <span>•</span>
                           <span>{item.publishedDate}</span>
                        </div>
                     </div>
                     <span className="text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded-full">Active</span>
                  </div>
               ))}
            </div>
         </div>

         {/* System Status / Feedback */}
         <div className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
               <h3 className="font-bold text-white">Хэрэглэгчийн сонирхол (Top Topics)</h3>
            </div>
            <div className="p-6">
               <div className="space-y-4">
                  {feedbackSummary.topRequestedTopics.map((topic, idx) => (
                     <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-300">{topic}</span>
                        <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-purple" style={{ width: `${100 - (idx * 20)}%` }}></div>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="mt-8 p-4 bg-brand-surface rounded-xl border border-dashed border-white/10">
                  <div className="flex items-center gap-3">
                     <Clock className="text-slate-400" size={20} />
                     <p className="text-sm text-slate-400">Сүүлийн шинэчлэлт: Яг одоо</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};