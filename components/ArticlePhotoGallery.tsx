import React, { useState, useEffect } from 'react';
import { 
  Images, X, ChevronLeft, ChevronRight, Maximize2, ZoomIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryImage {
  url: string;
  caption?: string;
}

interface ArticlePhotoGalleryProps {
  images: Array<GalleryImage | string>;
  title?: string;
}

export const ArticlePhotoGallery: React.FC<ArticlePhotoGalleryProps> = ({ images, title }) => {
  if (!images || images.length === 0) return null;

  // Normalize image items
  const normalizedImages: GalleryImage[] = images.map(img => {
    if (typeof img === 'string') {
      return { url: img, caption: '' };
    }
    return { url: img.url, caption: img.caption || '' };
  }).filter(img => Boolean(img.url));

  if (normalizedImages.length === 0) return null;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + normalizedImages.length) % normalizedImages.length);
  };

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % normalizedImages.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return (
    <div className="my-14 p-6 sm:p-8 bg-surface border border-border rounded-3xl space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shadow-inner">
            <Images size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-main tracking-tight">
              Зургийн Цомог
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Нийт {normalizedImages.length} гэрэл зураг
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {normalizedImages.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-surfaceHighlight border border-border/70 cursor-pointer shadow-sm hover:shadow-md"
          >
            <img
              src={img.url || '/placeholder-article.svg'}
              alt={img.caption || `${title || 'Нийтлэл'} - Зураг ${idx + 1}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder-article.svg';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
              <div className="flex justify-end">
                <span className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg">
                  <ZoomIn size={16} />
                </span>
              </div>
              <div>
                {img.caption ? (
                  <p className="text-xs font-medium line-clamp-2 text-white/90">
                    {img.caption}
                  </p>
                ) : (
                  <span className="text-[11px] font-semibold text-white/70">
                    Зураг {idx + 1} / {normalizedImages.length}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 select-none"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div 
              className="flex items-center justify-between text-white relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-medium text-white/80">
                {lightboxIndex + 1} / {normalizedImages.length}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Хаах (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Center Image */}
            <div 
              className="relative flex-1 flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={normalizedImages[lightboxIndex].url || '/placeholder-article.svg'}
                alt={normalizedImages[lightboxIndex].caption || 'Enlarged image'}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-article.svg';
                }}
                className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
              />

              {/* Prev Button */}
              {normalizedImages.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm"
                  title="Өмнөх зураг"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Next Button */}
              {normalizedImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm"
                  title="Дараагийн зураг"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Caption */}
            <div 
              className="text-center text-white/90 text-sm py-2 max-w-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {normalizedImages[lightboxIndex].caption && (
                <p className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 inline-block font-light">
                  {normalizedImages[lightboxIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
