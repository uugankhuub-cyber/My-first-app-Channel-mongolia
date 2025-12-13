import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles, Languages, RefreshCw, Wand2 } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { ContentItem } from '../../types';

export const AdminEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminContent, saveContent, askAI } = useAdmin();
  
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'mn' | 'en'>('mn'); // Editor Language State
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (id) {
       const found = adminContent.find(c => c.id === id);
       if (found) {
          setFormData(JSON.parse(JSON.stringify(found)));
       } else if (id === 'new') {
          setFormData({
              id: `draft-${Date.now()}`,
              status: 'draft',
              views: 0,
              readTimeValue: 5,
              isVideo: false,
              tags: [], tags_en: []
          });
       }
    }
    setLoading(false);
  }, [id, adminContent]);

  const handleChange = (field: keyof ContentItem, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status: 'published' | 'draft') => {
     if (formData.id) {
        const success = await saveContent({
           ...formData as ContentItem,
           status: status,
           publishedDate: status === 'published' ? new Date().toISOString().split('T')[0] : formData.publishedDate || ''
        });
        if (success) navigate('/admin/content');
        else alert('Failed to save. Check network or auth.');
     }
  };

  // AI Helper Function
  const handleAI = async (action: string, targetField: 'contentBody' | 'description' | 'title') => {
      // Determine source text based on current language
      const sourceField = lang === 'mn' 
          ? (targetField) 
          : (targetField + '_en') as keyof ContentItem;
      
      const text = formData[sourceField] as string;
      
      if (!text) {
          alert('Please enter some text first.');
          return;
      }

      setAiLoading(true);
      const result = await askAI(action, text, lang);
      setAiLoading(false);

      if (result) {
          if (confirm('AI Generated Suggestion:\n\n' + result + '\n\nApply this change?')) {
              // Apply to the specific language field
              handleChange(sourceField, result);
          }
      }
  };

  const handleTranslate = async () => {
      // Translate all fields from current lang to other lang
      const sourceSuffix = lang === 'mn' ? '' : '_en';
      const targetSuffix = lang === 'mn' ? '_en' : '';
      
      const title = formData[`title${sourceSuffix}` as keyof ContentItem] as string;
      const desc = formData[`description${sourceSuffix}` as keyof ContentItem] as string;
      
      if (!title) return;

      setAiLoading(true);
      const newTitle = await askAI('translate', title, lang);
      const newDesc = await askAI('translate', desc, lang);
      setAiLoading(false);

      setFormData(prev => ({
          ...prev,
          [`title${targetSuffix}`]: newTitle,
          [`description${targetSuffix}`]: newDesc
      }));
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!formData.id) return <div className="p-8 text-white">Content not found</div>;

  // Dynamic field names based on selected language
  const titleField = lang === 'mn' ? 'title' : 'title_en';
  const descField = lang === 'mn' ? 'description' : 'description_en';
  const bodyField = lang === 'mn' ? 'contentBody' : 'contentBody_en';
  const catField = lang === 'mn' ? 'category' : 'category_en';

  return (
    <div className="max-w-6xl mx-auto pb-20">
       {/* Toolbar */}
       <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md py-4 z-40 border-b border-white/5">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/admin/content')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-bold text-white">
                   {formData.status === 'draft' ? 'Draft Editor' : 'Edit Article'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                   <button 
                      onClick={() => setLang('mn')}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${lang === 'mn' ? 'bg-brand-purple text-white' : 'text-slate-500 hover:text-white'}`}
                   >
                      Mongolian
                   </button>
                   <button 
                      onClick={() => setLang('en')}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${lang === 'en' ? 'bg-brand-purple text-white' : 'text-slate-500 hover:text-white'}`}
                   >
                      English
                   </button>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleTranslate}
               disabled={aiLoading}
               className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
               title="Translate to other language"
             >
                <Languages size={20} />
             </button>
             <button 
               onClick={() => handleSave('draft')}
               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-colors"
             >
                Save Draft
             </button>
             <button 
               onClick={() => handleSave('published')}
               className="px-6 py-2 bg-gradient-brand text-white rounded-lg font-bold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2"
             >
                <Save size={16} />
                Publish
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Title */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 group relative">
                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider flex justify-between">
                    Title ({lang.toUpperCase()})
                    <button onClick={() => handleAI('improve', 'title')} className="text-brand-purple hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <Sparkles size={12} /> Improve
                    </button>
                </label>
                <input 
                   type="text" 
                   value={formData[titleField] || ''} 
                   onChange={(e) => handleChange(titleField, e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-brand-purple outline-none"
                   placeholder={lang === 'mn' ? 'Гарчиг оруулах...' : 'Enter title...'}
                />
             </div>

             {/* Description */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 group relative">
                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider flex justify-between">
                    Description ({lang.toUpperCase()})
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button onClick={() => handleAI('summarize', 'description')} className="text-brand-purple hover:text-white transition-colors flex items-center gap-1">
                            <Wand2 size={12} /> Summarize
                        </button>
                        <button onClick={() => handleAI('improve', 'description')} className="text-brand-purple hover:text-white transition-colors flex items-center gap-1">
                            <Sparkles size={12} /> Improve
                        </button>
                    </div>
                </label>
                <textarea 
                   rows={3}
                   value={formData[descField] || ''} 
                   onChange={(e) => handleChange(descField, e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-slate-300 focus:border-brand-purple outline-none resize-none"
                />
             </div>

             {/* Body */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 min-h-[500px] group relative">
                <label className="block text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider flex justify-between">
                    Content Body ({lang.toUpperCase()})
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                         <button onClick={() => handleAI('expand', 'contentBody')} className="text-brand-purple hover:text-white transition-colors flex items-center gap-1">
                            <Wand2 size={12} /> Expand
                        </button>
                        <button onClick={() => handleAI('improve', 'contentBody')} className="text-brand-purple hover:text-white transition-colors flex items-center gap-1">
                            <Sparkles size={12} /> Improve
                        </button>
                    </div>
                </label>
                <textarea 
                   value={formData[bodyField] || ''} 
                   onChange={(e) => handleChange(bodyField, e.target.value)}
                   className="w-full h-[600px] bg-[#0F172A] border border-white/10 rounded-lg px-4 py-4 text-slate-300 font-mono text-sm focus:border-brand-purple outline-none leading-relaxed"
                   placeholder="Write your article content here (Markdown supported)..."
                />
             </div>

          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
             
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-4">Meta Data</h3>
                
                <div className="space-y-4">
                   <div>
                      <label className="block text-slate-400 text-xs font-bold mb-2">Category ({lang.toUpperCase()})</label>
                      <select 
                         value={formData[catField] || ''}
                         onChange={(e) => handleChange(catField, e.target.value)}
                         className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                      >
                         <option value="">Select...</option>
                         {CATEGORIES.map(cat => (
                            <option key={cat.id} value={lang === 'mn' ? cat.label : cat.label_en}>
                                {lang === 'mn' ? cat.label : cat.label_en}
                            </option>
                         ))}
                      </select>
                   </div>

                   <div>
                      <label className="block text-slate-400 text-xs font-bold mb-2">Thumbnail URL</label>
                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={formData.thumbnailUrl || ''} 
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
                </div>
             </div>

             {/* AI Status */}
             {aiLoading && (
                 <div className="p-4 bg-brand-purple/20 border border-brand-purple/50 rounded-xl flex items-center gap-3 animate-pulse">
                     <RefreshCw size={20} className="animate-spin text-brand-purple" />
                     <span className="text-white text-sm font-bold">AI Processing...</span>
                 </div>
             )}

          </div>
       </div>
    </div>
  );
};
