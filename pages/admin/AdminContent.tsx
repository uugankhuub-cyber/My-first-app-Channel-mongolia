import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Edit, Trash2, Eye, FileText, CheckCircle } from 'lucide-react';
import { Link } from '../../context/LanguageContext';

export const AdminContent: React.FC = () => {
  const { adminContent, deleteContent } = useAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Бүх контент</h1>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-[#1E293B] border border-white/10 text-white rounded-lg text-sm hover:bg-white/5">Шүүлтүүр</button>
           <button className="px-4 py-2 bg-gradient-brand text-white rounded-lg text-sm font-bold shadow-glow">+ Шинэ</button>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-[#0F172A] border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Гарчиг</th>
                  <th className="p-4 font-semibold">Төлөв</th>
                  <th className="p-4 font-semibold">Ангилал</th>
                  <th className="p-4 font-semibold">Огноо</th>
                  <th className="p-4 font-semibold text-right">Үйлдэл</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {adminContent.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           <img src={item.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover bg-gray-800" />
                           <span className="text-white font-medium text-sm line-clamp-1 max-w-[200px]">{item.title}</span>
                        </div>
                     </td>
                     <td className="p-4">
                        {item.status === 'published' ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                              <CheckCircle size={10} /> Нийтлэгдсэн
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                              <FileText size={10} /> Ноорог
                           </span>
                        )}
                     </td>
                     <td className="p-4 text-slate-400 text-sm">{item.category}</td>
                     <td className="p-4 text-slate-400 text-sm">{item.publishedDate}</td>
                     <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Link to={`/admin/content/edit/${item.id}`} className="p-2 text-slate-400 hover:text-brand-purple hover:bg-white/10 rounded-lg">
                              <Edit size={16} />
                           </Link>
                           <button 
                              onClick={() => deleteContent(item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white/10 rounded-lg"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};