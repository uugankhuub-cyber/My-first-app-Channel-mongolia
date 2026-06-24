
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles, Wand2, UploadCloud, RefreshCw, Type, List, Quote } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { ContentItem } from '../../types';

const { useNavigate, useParams } = ReactRouterDOM;

export const AdminEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminContent, saveContent, askAI, uploadImage } = useAdmin();
  
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        if (success) {
            navigate('/admin/content');
        } else {
            alert('Failed to save. Check network or auth.');
        }
     }
  };

  const handleAI = async (action: string, targetField: 'contentBody' | 'description') => {
      const text = formData[targetField] as string;
      if (!text) return alert('Please enter some text first.');

      setAiLoading(true);
      const result = await askAI(action, text);
      setAiLoading(false);

      if (result && result !== "AI Error") {
          if (confirm('AI Suggestion:\n\n' + result + '\n\nApply?')) {
              handleChange(targetField, result);
          }
      } else {
          alert('AI request failed.');
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploading(true);
          const url = await uploadImage(e.target.files[0]);
          setUploading(false);
          if (url) {
              handleChange('thumbnailUrl', url);
          } else {
              alert('Upload failed');
          }
      }
  };

  // Simple Rich Text Insert
  const insertTag = (tag: string) => {
      const textarea = document.getElementById('bodyEditor') as HTMLTextAreaElement;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const selection = text.substring(start, end);
      
      let newText = '';
      if (tag === 'b') newText = `<b>${selection}</b>`;
      if (tag === 'i') newText = `<i>${selection}</i>`;
      if (tag === 'u') newText = `<u>${selection}</u>`;
      if (tag === 'h2') newText = `<h2>${selection}</h2>`;
      if (tag === 'ul') newText = `<ul>\n<li>${selection}</li>\n</ul>`;
      if (tag === 'link') newText = `<a href="#">${selection}</a>`;
      
      handleChange('contentBody', before + newText + after);
  };

  const transformText = (type: 'upper' | 'lower') => {
      const textarea = document.getElementById('bodyEditor') as HTMLTextAreaElement;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selection = text.substring(start, end);
      
      let newSelection = selection;
      if (type === 'upper') newSelection = selection.toUpperCase();
      if (type === 'lower') newSelection = selection.toLowerCase();
      
      handleChange('contentBody', text.substring(0, start) + newSelection + text.substring(end));
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!formData.id) return <div className="p-8 text-white">Content not found</div>;

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
                <span className="text-xs text-slate-500">ID: {formData.id}</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
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
                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Title</label>
                <input 
                   type="text" 
                   value={formData.title || ''} 
                   onChange={(e) => handleChange('title', e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-lg focus:border-brand-purple outline-none"
                   placeholder="Enter article title..."
                />
             </div>

             {/* Description with AI */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 group relative">
                <div className="flex justify-between mb-2">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Description</label>
                    <div className="flex gap-2">
                        <button onClick={() => handleAI('improve', 'description')} className="text-brand-purple hover:text-white text-xs flex items-center gap-1 transition-colors">
                            <Sparkles size={12} /> Improve
                        </button>
                        <button onClick={() => handleAI('summarize', 'description')} className="text-brand-purple hover:text-white text-xs flex items-center gap-1 transition-colors">
                            <Wand2 size={12} /> Summarize
                        </button>
                    </div>
                </div>
                <textarea 
                   rows={3}
                   value={formData.description || ''} 
                   onChange={(e) => handleChange('description', e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-slate-300 focus:border-brand-purple outline-none resize-none"
                   placeholder="Short summary for SEO and cards..."
                />
             </div>

             {/* Body Editor */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 min-h-[500px] group relative">
                <div className="flex flex-wrap justify-between mb-4 gap-2">
                    <div className="flex items-center gap-1">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">Content</label>
                        <button onClick={() => insertTag('b')} className="p-1 hover:bg-white/10 rounded text-white" title="Bold">B</button>
                        <button onClick={() => insertTag('i')} className="p-1 hover:bg-white/10 rounded text-white" title="Italic">I</button>
                        <button onClick={() => insertTag('u')} className="p-1 hover:bg-white/10 rounded text-white" title="Underline">U</button>
                        <button onClick={() => insertTag('h2')} className="p-1 hover:bg-white/10 rounded text-white" title="Header"><Type size={14}/></button>
                        <button onClick={() => insertTag('ul')} className="p-1 hover:bg-white/10 rounded text-white" title="List"><List size={14}/></button>
                        <button onClick={() => insertTag('link')} className="p-1 hover:bg-white/10 rounded text-white" title="Link">Link</button>
                        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                        <button onClick={() => transformText('upper')} className="p-1 hover:bg-white/10 rounded text-white text-xs">UP</button>
                        <button onClick={() => transformText('lower')} className="p-1 hover:bg-white/10 rounded text-white text-xs">low</button>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => handleAI('expand', 'contentBody')} className="text-brand-purple hover:text-white text-xs flex items-center gap-1 transition-colors">
                            <Wand2 size={12} /> Expand
                        </button>
                        <button onClick={() => handleAI('improve', 'contentBody')} className="text-brand-purple hover:text-white text-xs flex items-center gap-1 transition-colors">
                            <Sparkles size={12} /> Improve
                        </button>
                    </div>
                </div>
                <textarea 
                   id="bodyEditor"
                   value={formData.contentBody || ''} 
                   onChange={(e) => handleChange('contentBody', e.target.value)}
                   className="w-full h-[600px] bg-[#0F172A] border border-white/10 rounded-lg px-4 py-4 text-slate-300 font-mono text-sm focus:border-brand-purple outline-none leading-relaxed"
                   placeholder="Write content here. HTML tags allowed (<b>, <i>, <p>)..."
                />
             </div>

          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
             
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="font-bold text-white">Settings</h3>
                
                {/* Category */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-2">Category</label>
                  <select 
                     value={formData.category || ''}
                     onChange={(e) => handleChange('category', e.target.value)}
                     className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                  >
                     <option value="">Select...</option>
                     {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.label}>{cat.label}</option>
                     ))}
                  </select>
                </div>

                {/* Read Time */}
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-2">Read Time (min)</label>
                   <input 
                      type="number" 
                      value={formData.readTimeValue || 5} 
                      onChange={(e) => handleChange('readTimeValue', parseInt(e.target.value))}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                   />
                </div>

                {/* Tags */}
                <div>
                   <label className="block text-slate-400 text-xs font-bold mb-2">Tags (comma separated)</label>
                   <input 
                      type="text" 
                      value={formData.tags?.join(', ') || ''} 
                      onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()))}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                   />
                </div>

             </div>

             {/* Image Upload */}
             <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="font-bold text-white">Thumbnail</h3>
                <div className="relative aspect-video bg-[#0F172A] rounded-lg border border-white/10 overflow-hidden flex items-center justify-center group">
                    {formData.thumbnailUrl ? (
                        <img src={formData.thumbnailUrl} alt="Thumb" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-3 py-1 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-1">
                            <UploadCloud size={12} />
                            {uploading ? 'Uploading...' : 'Replace'}
                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                    </div>
                </div>
                <input 
                   type="text" 
                   value={formData.thumbnailUrl || ''} 
                   onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                   className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none"
                   placeholder="https://..."
                />
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
