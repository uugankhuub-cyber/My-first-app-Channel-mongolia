import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Save, ArrowLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { ContentItem } from '../../types';

export const AdminEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminContent, saveContent } = useAdmin();
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       const found = adminContent.find(c => c.id === id);
       if (found) {
          setFormData(JSON.parse(JSON.stringify(found))); // Deep copy
       }
    } else {
       // New Item logic could go here
    }
    setLoading(false);
  }, [id, adminContent]);

  const handleChange = (field: keyof ContentItem, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (status: 'published' | 'draft') => {
     if (formData.id && formData.title) {
        saveContent({
           ...formData as ContentItem,
           status: status,
           publishedDate: status === 'published' ? new Date().toISOString().split('T')[0] : formData.publishedDate || ''
        });
        navigate('/admin/content');
     }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!formData.id) return <div className="p-8 text-white">Content not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
       {/* Toolbar */}
       <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0F172A]/90 backdrop-blur-md py-4 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/admin/content')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-bold text-white">
                   {formData.status === 'draft' ? 'Ноорог засварлах' : 'Нийтлэл засварлах'}
                </h1>
                <span className={`text-xs px-2 py-0.5 rounded border ${formData.status === 'published' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                   {formData.status === 'published' ? 'Нийтлэгдсэн' : 'Ноорог'}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => handleSave('draft')}
               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-colors"
             >
                Хадгалах
             </button>
             <button 
               onClick={() => handleSave('published')}
               className="px-6 py-2 bg-gradient-brand text-white rounded-lg font-bold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2"
             >
                <Save size={16} />
                Нийтлэх
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
             
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5">
                <label className="block text-slate-400 text-sm font-bold mb-2">Гарчиг</label>
                <input 
                   type="text" 
                   value={formData.title} 
                   onChange={(e) => handleChange('title', e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-brand-purple outline-none"
                />
             </div>

             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5">
                <label className="block text-slate-400 text-sm font-bold mb-2">Тайлбар (Товч)</label>
                <textarea 
                   rows={3}
                   value={formData.description} 
                   onChange={(e) => handleChange('description', e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-slate-300 focus:border-brand-purple outline-none resize-none"
                />
             </div>

             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 min-h-[500px]">
                <label className="block text-slate-400 text-sm font-bold mb-4">Үндсэн агуулга</label>
                <textarea 
                   value={formData.contentBody} 
                   onChange={(e) => handleChange('contentBody', e.target.value)}
                   className="w-full h-[400px] bg-[#0F172A] border border-white/10 rounded-lg px-4 py-4 text-slate-300 font-mono text-sm focus:border-brand-purple outline-none leading-relaxed"
                />
             </div>

          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
             
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-4">Тохиргоо</h3>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-slate-400 text-xs font-bold mb-2">Ангилал</label>
                      <select 
                         value={formData.category}
                         onChange={(e) => handleChange('category', e.target.value)}
                         className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                      >
                         {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.label}>{cat.label}</option>
                         ))}
                      </select>
                   </div>

                   <div>
                      <label className="block text-slate-400 text-xs font-bold mb-2">Зураг (URL)</label>
                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={formData.thumbnailUrl} 
                            onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                            className="flex-1 bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none truncate"
                         />
                         <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <ImageIcon size={16} className="text-slate-400" />
                         </button>
                      </div>
                      {formData.thumbnailUrl && (
                         <div className="mt-2 rounded-lg overflow-hidden border border-white/10 aspect-video">
                            <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                         </div>
                      )}
                   </div>

                   <div>
                      <label className="block text-slate-400 text-xs font-bold mb-2">Унших хугацаа (минут)</label>
                      <input 
                         type="number" 
                         value={formData.readTimeValue} 
                         onChange={(e) => handleChange('readTimeValue', parseInt(e.target.value))}
                         className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                      />
                   </div>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};
