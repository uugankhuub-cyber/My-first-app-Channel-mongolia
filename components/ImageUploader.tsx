import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ImageUploader: React.FC = () => {
  const { addImage } = useAdmin();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Зөвхөн зураг оруулна уу (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Зургийн хэмжээ 5MB-аас ихгүй байх ёстой');
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    // Simulate API call to /api/upload
    try {
      // In a real app, you would send FormData here
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        // body: formData  // Commented out for mock mode to avoid body parsing issues in some dev envs
      });

      if (!res.ok) throw new Error('Upload failed');

      // Since we are mocking the storage, we use the local data URL as the "hosted" URL
      // In production, you would use the URL returned from the server
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        addImage({
          id: Date.now().toString(),
          url: url,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
        setIsUploading(false);
        setPreview(null);
      };
      reader.readAsDataURL(file);

    } catch (e) {
      console.error(e);
      setError('Алдаа гарлаа. Дахин оролдоно уу.');
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-brand-purple bg-brand-purple/10' 
            : 'border-slate-700 bg-[#1E293B] hover:border-slate-500'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {isUploading ? (
          <div className="flex flex-col items-center py-4">
             <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-3"></div>
             <p className="text-slate-300 font-medium">Хуулж байна...</p>
          </div>
        ) : preview ? (
          <div className="relative group">
             <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg" />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <p className="text-white font-bold">Өөр зураг сонгох</p>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Upload size={24} />
             </div>
             <div>
                <p className="text-white font-medium">Зураг оруулах</p>
                <p className="text-slate-500 text-sm mt-1">Drag & Drop or Click to browse</p>
             </div>
             <p className="text-xs text-slate-600">JPG, PNG, WebP (Max 5MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
           <AlertCircle size={16} />
           <span>{error}</span>
        </div>
      )}
    </div>
  );
};