import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Trash2, Copy, Check } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

export const AdminImages: React.FC = () => {
  const { uploadedImages, deleteImage } = useAdmin();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Зургийн сан</h1>
        <p className="text-slate-400">Сайт дээр ашиглах зургуудыг удирдах</p>
      </div>

      <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5">
         <h3 className="font-bold text-white mb-4">Шинэ зураг оруулах</h3>
         <ImageUploader />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {uploadedImages.map(img => (
            <div key={img.id} className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden group">
               <div className="aspect-square relative bg-black/20">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                        onClick={() => copyToClipboard(img.url, img.id)}
                        className="p-2 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform"
                        title="URL хуулах"
                     >
                        {copiedId === img.id ? <Check size={16} /> : <Copy size={16} />}
                     </button>
                     <button 
                        onClick={() => deleteImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                        title="Устгах"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
               <div className="p-3">
                  <p className="text-white text-sm font-medium truncate" title={img.name}>{img.name}</p>
                  <div className="flex justify-between items-center mt-1">
                     <span className="text-xs text-slate-500">{(img.size / 1024).toFixed(1)} KB</span>
                     <span className="text-xs text-slate-500">{new Date(img.uploadedAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
         ))}
         {uploadedImages.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
               Одоогоор зураг байхгүй байна.
            </div>
         )}
      </div>
    </div>
  );
};