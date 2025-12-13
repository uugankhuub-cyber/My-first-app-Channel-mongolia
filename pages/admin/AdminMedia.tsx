import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MonitorPlay, Upload, Check } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

const SLOTS = [
  { key: 'hero_bg', label: 'Hero Background (Optional)', default: '' },
  { key: 'about_img', label: 'About Page Image', default: '' },
];

export const AdminMedia: React.FC = () => {
  const { siteImages, updateSiteImage, addImage } = useAdmin();
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // We reuse ImageUploader, but catch the upload via Context changes
  // Ideally ImageUploader would take an onUpload callback, but to keep changes small
  // we will create a small wrapper or just instruct admin to upload then paste URL.
  // UPDATE: Given the constraints, let's make a simple input wrapper that works with "Uploaded Images" gallery or direct URL.

  const [tempUrl, setTempUrl] = useState('');

  const handleSave = () => {
    if (activeSlot && tempUrl) {
      updateSiteImage(activeSlot, tempUrl);
      setActiveSlot(null);
      setTempUrl('');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
           <MonitorPlay className="text-brand-purple" />
           Медиа солих
        </h1>
        <p className="text-slate-400">Сайтын үндсэн зургуудыг солих</p>
      </div>

      <div className="grid gap-6">
        {SLOTS.map((slot) => {
           const currentUrl = siteImages[slot.key];
           
           return (
             <div key={slot.key} className="bg-[#1E293B] p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-start">
                
                {/* Preview */}
                <div className="w-full md:w-1/3 aspect-video bg-black/20 rounded-lg overflow-hidden border border-white/10 relative">
                   {currentUrl ? (
                      <img src={currentUrl} alt={slot.label} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Custom Image</div>
                   )}
                   <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                      {slot.key}
                   </div>
                </div>

                {/* Controls */}
                <div className="flex-1 w-full">
                   <h3 className="font-bold text-white mb-2">{slot.label}</h3>
                   <p className="text-xs text-slate-400 mb-4">Paste an image URL below to replace the default image.</p>
                   
                   <div className="flex gap-2">
                      <input 
                         type="text" 
                         placeholder="https://..."
                         className="flex-1 bg-[#0F172A] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-purple"
                         defaultValue={currentUrl}
                         onChange={(e) => updateSiteImage(slot.key, e.target.value)} 
                      />
                   </div>
                   <p className="text-[10px] text-slate-500 mt-2">
                      Tip: Upload image in "Image Gallery" first, then copy URL here.
                   </p>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};