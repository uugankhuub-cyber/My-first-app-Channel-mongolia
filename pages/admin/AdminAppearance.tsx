import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Palette, RefreshCcw, Save, Type } from 'lucide-react';

export const AdminAppearance: React.FC = () => {
  const { siteAppearance, updateSiteAppearance, resetSiteAppearance } = useAdmin();
  const [formData, setFormData] = useState(siteAppearance);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof typeof siteAppearance, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSiteAppearance(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetSiteAppearance();
    setFormData({
      fontFamily: 'Inter',
      baseFontSize: 16,
      letterSpacing: 0
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Palette className="text-brand-purple" />
              Гадаад төрх
           </h1>
           <p className="text-slate-400">Сайтын текстийн тохиргоог өөрчлөх</p>
        </div>
        <div className="flex gap-3">
            <button 
               onClick={handleReset}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-medium hover:bg-white/10 transition-all"
            >
               <RefreshCcw size={16} /> Reset
            </button>
            <button 
               onClick={handleSave}
               className="flex items-center gap-2 px-6 py-2 bg-gradient-brand text-white rounded-xl font-bold hover:shadow-glow transition-all"
            >
               {saved ? 'Хадгалагдлаа!' : <><Save size={18} /> Хадгалах</>}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Settings Form */}
         <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 space-y-6">
            
            <div>
               <label className="block text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                  <Type size={16} /> Font Family
               </label>
               <select 
                  value={formData.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-purple"
               >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
               </select>
            </div>

            <div>
               <label className="block text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                  <span>Base Font Size</span>
                  <span className="text-xs bg-brand-purple px-2 py-0.5 rounded text-white">{formData.baseFontSize}px</span>
               </label>
               <input 
                  type="range" 
                  min="12" 
                  max="20" 
                  step="1"
                  value={formData.baseFontSize}
                  onChange={(e) => handleChange('baseFontSize', parseInt(e.target.value))}
                  className="w-full accent-brand-purple"
               />
               <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>12px</span>
                  <span>16px</span>
                  <span>20px</span>
               </div>
            </div>

            <div>
               <label className="block text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                  <span>Letter Spacing</span>
                  <span className="text-xs bg-brand-purple px-2 py-0.5 rounded text-white">{formData.letterSpacing}px</span>
               </label>
               <input 
                  type="range" 
                  min="-2" 
                  max="5" 
                  step="0.5"
                  value={formData.letterSpacing}
                  onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full accent-brand-purple"
               />
               <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>-2px</span>
                  <span>0px</span>
                  <span>5px</span>
               </div>
            </div>

         </div>

         {/* Live Preview */}
         <div className="bg-white dark:bg-[#020617] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg">
            <h3 className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-4">Live Preview</h3>
            
            <div style={{ 
               fontFamily: formData.fontFamily, 
               fontSize: `${formData.baseFontSize}px`,
               letterSpacing: `${formData.letterSpacing}px`,
               lineHeight: 1.6
            }} className="text-gray-900 dark:text-slate-200">
               <h2 className="text-2xl font-bold mb-4">Гарчиг жишээ</h2>
               <p className="mb-4">
                  Энэ бол таны сайтын текстийн тохиргоог харуулах жишээ бичвэр юм. Та зүүн талын цонхонд өөрчлөлт оруулахад энд шууд харагдах болно.
               </p>
               <p className="text-sm opacity-80">
                  Жижиг хэмжээтэй бичвэр нь иймэрхүү харагдана.
               </p>
               <button className="mt-4 px-4 py-2 bg-gradient-brand text-white rounded-lg font-bold text-sm">
                  Товчлуур
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};