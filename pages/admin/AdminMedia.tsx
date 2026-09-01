import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MonitorPlay, Save } from 'lucide-react';

const SLOTS = [
  { key: 'hero_bg', label: 'Hero Section Background', desc: 'Main image on homepage' },
  { key: 'about_img', label: 'About Us Image', desc: 'Featured image on About page' },
];

export const AdminMedia: React.FC = () => {
  const { siteImages, updateSiteImage } = useAdmin();
  
  // Local state to manage inputs before saving? 
  // For this MVP, we bind directly to context but show save confirmation could be nice.
  // Actually, direct binding is easiest for MVP "Config Store" requirement.

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main mb-2 flex items-center gap-2">
           <MonitorPlay className="text-brand-purple" />
           Медиа солих
        </h1>
        <p className="text-text-muted">Сайтын үндсэн зургуудыг солих</p>
      </div>

      <div className="grid gap-6">
        {SLOTS.map((slot) => {
           const currentUrl = siteImages[slot.key];
           
           return (
             <div key={slot.key} className="bg-surface shadow-[var(--shadow-card)] p-6 rounded-xl border border-border flex flex-col md:flex-row gap-6 items-start">
                
                {/* Preview */}
                <div className="w-full md:w-1/3 aspect-video bg-black/20 rounded-lg overflow-hidden border border-border relative group">
                   {currentUrl ? (
                      <img src={currentUrl} alt={slot.label} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
                         <span className="text-xs">No Custom Image</span>
                         <span className="text-[10px] opacity-50">Using Default</span>
                      </div>
                   )}
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-text-main text-xs font-bold">{slot.key}</span>
                   </div>
                </div>

                {/* Controls */}
                <div className="flex-1 w-full">
                   <h3 className="font-bold text-text-main mb-1">{slot.label}</h3>
                   <p className="text-xs text-text-muted mb-4">{slot.desc}</p>
                   
                   <div className="space-y-3">
                      <div>
                         <label className="block text-xs font-bold text-text-muted mb-1">Image URL</label>
                         <input 
                            type="text" 
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-[#0F172A] border border-border rounded-lg px-4 py-2 text-text-main outline-none focus:border-brand-purple transition-colors text-sm"
                            value={currentUrl || ''}
                            onChange={(e) => updateSiteImage(slot.key, e.target.value)} 
                         />
                      </div>
                      <p className="text-[10px] text-text-muted">
                         Note: You can upload an image in the "Image Gallery" section, copy its URL, and paste it here.
                      </p>
                   </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};