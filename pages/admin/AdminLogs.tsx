import React from 'react';
import { ScrollText, AlertCircle, Info, CheckCircle } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  // Mock logs
  const logs = [
    { id: 1, type: 'info', message: 'Admin user logged in', time: 'Just now' },
    { id: 2, type: 'success', message: 'New article "AI Future" saved as draft', time: '5 mins ago' },
    { id: 3, type: 'warning', message: 'Image upload took longer than expected', time: '1 hour ago' },
    { id: 4, type: 'info', message: 'System stats updated', time: '2 hours ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={16} className="text-blue-400" />;
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
           <ScrollText className="text-brand-purple" />
           Систем лог
        </h1>
        <p className="text-slate-400">Системийн үйл ажиллагааны түүх</p>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#0F172A]/50">
           <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
           </div>
        </div>
        <div className="divide-y divide-white/5">
           {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors font-mono text-sm">
                 <div className={`p-2 rounded-lg bg-opacity-10 ${
                    log.type === 'info' ? 'bg-blue-500' : 
                    log.type === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                 }`}>
                    {getIcon(log.type)}
                 </div>
                 <div className="flex-1">
                    <p className="text-slate-200">{log.message}</p>
                 </div>
                 <span className="text-slate-500 text-xs">{log.time}</span>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};