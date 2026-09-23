import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Plus, Trash2, Check, Star, 
  ExternalLink, Copy, CornerDownLeft, Loader2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ArticleImageItem {
  id: string;
  url: string;
  caption: string;
}

interface ArticleImageGalleryProps {
  images: ArticleImageItem[];
  onImagesChange: (images: ArticleImageItem[]) => void;
  onInsertToContent: (url: string, caption: string) => void;
  onSetThumbnail: (url: string) => void;
  currentThumbnail?: string;
}

export const ArticleImageGallery: React.FC<ArticleImageGalleryProps> = ({
  images,
  onImagesChange,
  onInsertToContent,
  onSetThumbnail,
  currentThumbnail
}) => {
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload handler for one or multiple files
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const newItems: ArticleImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Convert file to Base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const commaIndex = res.indexOf(',');
            resolve(commaIndex >= 0 ? res.substring(commaIndex + 1) : res);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Post to server upload endpoint
        const response = await fetch('/api/admin-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileBase64: base64
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            // Clean up name for initial caption
            const cleanName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]+/g, ' ')
              .trim();

            newItems.push({
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
              url: data.url,
              caption: cleanName
            });
          }
        }
      }

      if (newItems.length > 0) {
        const updated = [...images, ...newItems];
        onImagesChange(updated);

        // If no thumbnail set yet, automatically make the first uploaded image the thumbnail
        if (!currentThumbnail && updated.length > 0) {
          onSetThumbnail(updated[0].url);
        }
      }
    } catch (err) {
      console.error('Multi-image upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Add via external URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newItem: ArticleImageItem = {
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      url: newUrl.trim(),
      caption: newCaption.trim()
    };

    const updated = [...images, newItem];
    onImagesChange(updated);

    if (!currentThumbnail) {
      onSetThumbnail(newItem.url);
    }

    setNewUrl('');
    setNewCaption('');
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    const updated = images.map(img => img.id === id ? { ...img, caption } : img);
    onImagesChange(updated);
  };

  const handleDeleteImage = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    onImagesChange(updated);
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-text-main font-bold text-base flex items-center gap-2">
            <ImageIcon size={18} className="text-brand-purple" />
            <span>Нийтлэлийн Зургийн Сан & Цомог</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold font-mono">
              {images.length} зураг
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Олон зураг нэгэн зэрэг оруулж, нүүр зураг болгох эсвэл нийтлэлийн хүссэн хэсэгт 1 товшилтоор байршуулна.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span>{uploading ? 'Хуулж байна...' : 'Олон зураг сонгож хуулах'}</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]' 
            : 'border-border/80 hover:border-brand-purple/40 bg-background/50 hover:bg-surfaceHighlight/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shadow-inner">
            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <p className="text-sm font-bold text-text-main">
            {uploading ? 'Зургуудыг серверт байршуулж байна...' : 'Зургуудаа энд чирч оруулах эсвэл товшиж сонгоно уу'}
          </p>
          <p className="text-xs text-text-muted">
            PNG, JPG, WEBP, GIF дэмжинэ • Олон зураг нэгэн зэрэг сонгох боломжтой
          </p>
        </div>
      </div>

      {/* Or Add by External URL */}
      <form onSubmit={handleAddUrl} className="p-4 bg-background border border-border/80 rounded-xl space-y-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
          Эсвэл гадаад холбоос (URL)-аар зураг нэмэх:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="md:col-span-6">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (Зургийн URL)"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-main text-xs font-mono outline-none focus:border-brand-purple/50 transition-colors"
            />
          </div>
          <div className="md:col-span-4">
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Зургийн тайлбар..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-main text-xs outline-none focus:border-brand-purple/50 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!newUrl.trim()}
              className="w-full h-full py-2 px-3 bg-surfaceHighlight hover:bg-brand-purple hover:text-white text-text-main border border-border font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Plus size={14} />
              <span>Нэмэх</span>
            </button>
          </div>
        </div>
      </form>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-border/60 rounded-xl bg-background/30 text-text-muted text-xs">
          Нийтлэлд хараахан зураг ороогүй байна. Дээрх талбараар олон зураг сонгон оруулна уу.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {images.map((img, idx) => {
              const isThumbnail = currentThumbnail === img.url;
              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative group bg-background border rounded-2xl overflow-hidden flex flex-col transition-all shadow-sm ${
                    isThumbnail ? 'border-brand-purple ring-2 ring-brand-purple/20' : 'border-border hover:border-brand-purple/30'
                  }`}
                >
                  {/* Image View */}
                  <div className="relative aspect-video w-full bg-surfaceHighlight overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.caption || `Image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Thumbnail Badge */}
                    {isThumbnail && (
                      <div className="absolute top-2 left-2 bg-brand-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Star size={10} fill="currentColor" />
                        <span>Нүүр зураг</span>
                      </div>
                    )}

                    {/* Top Right Quick Actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(img.id, img.url)}
                        title="URL хуулах"
                        className="p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-sm transition-colors"
                      >
                        {copiedId === img.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        title="Устгах"
                        className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Caption input and Actions */}
                  <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => handleUpdateCaption(img.id, e.target.value)}
                        placeholder="Зургийн тайлбар бичих..."
                        className="w-full px-2.5 py-1.5 bg-surface border border-border/70 rounded-lg text-text-main text-xs outline-none focus:border-brand-purple/50 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                      {/* Insert into content button */}
                      <button
                        type="button"
                        onClick={() => onInsertToContent(img.url, img.caption)}
                        title="Нийтлэлийн бичвэр рүү оруулах"
                        className="flex-1 py-1.5 px-2 bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <CornerDownLeft size={12} />
                        <span>Нийтлэлд оруулах</span>
                      </button>

                      {/* Set as thumbnail button */}
                      <button
                        type="button"
                        onClick={() => onSetThumbnail(img.url)}
                        title="Нүүр зураг болгох"
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isThumbnail
                            ? 'bg-brand-purple text-white border-brand-purple'
                            : 'bg-surface hover:bg-surfaceHighlight text-text-muted hover:text-text-main border-border'
                        }`}
                      >
                        <Star size={14} fill={isThumbnail ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
