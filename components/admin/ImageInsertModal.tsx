import React, { useState, useRef } from 'react';
import { 
  X, Upload, Image as ImageIcon, Link2, CornerDownLeft, Loader2, Check 
} from 'lucide-react';
import { ArticleImageItem } from './ArticleImageGallery';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (url: string, caption: string) => void;
  galleryImages: ArticleImageItem[];
  onUploadNewImage: (files: FileList | File[]) => Promise<ArticleImageItem[] | void>;
}

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  galleryImages,
  onUploadNewImage
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInsertImage(url.trim(), caption.trim());
    setUrl('');
    setCaption('');
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await onUploadNewImage(e.target.files);
      if (Array.isArray(uploaded) && uploaded.length > 0) {
        // Automatically insert the uploaded image(s)
        uploaded.forEach(img => {
          onInsertImage(img.url, img.caption);
        });
        onClose();
      }
    } catch (err) {
      console.error('Modal upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            <h3 className="font-bold text-text-main text-base">Нийтлэл рүү зураг оруулах</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-main rounded-xl hover:bg-surfaceHighlight transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-background p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Upload size={14} />
            <span>Файл хуулах</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gallery' 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <ImageIcon size={14} />
            <span>Цомгоос ({galleryImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url' 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Link2 size={14} />
            <span>URL холбоос</span>
          </button>
        </div>

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4 py-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-brand-purple/50 bg-background/50 hover:bg-surfaceHighlight/50 rounded-2xl p-8 text-center cursor-pointer transition-all"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">
                    {uploading ? 'Зургийг серверт хуулж байна...' : 'Компьютерээс зураг сонгох'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Сонгосон зураг шууд серверт хуулагдаж, бичвэр дотор орно.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gallery Picker */}
        {activeTab === 'gallery' && (
          <div className="space-y-3">
            {galleryImages.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-xs border border-dashed border-border rounded-xl">
                Цомогт одоогоор зураг байхгүй байна. Файл хуулах хэсгээр зураг оруулна уу.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-2 gap-2.5">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      onInsertImage(img.url, img.caption);
                      onClose();
                    }}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-brand-purple cursor-pointer transition-all bg-background shadow-sm"
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2 py-1 bg-brand-purple text-white text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1">
                        <CornerDownLeft size={12} />
                        Оруулах
                      </span>
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-white text-[10px] truncate px-2 backdrop-blur-xs">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: External URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Зургийн URL хаяг</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-text-main font-mono outline-none focus:border-brand-purple/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-main">Зургийн тайлбар (Alt / Caption)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Зураг дээрх үйл явдлын тайлбар..."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-text-main outline-none focus:border-brand-purple/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!url.trim()}
              className="w-full py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <CornerDownLeft size={14} />
              <span>Нийтлэл рүү оруулах</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
