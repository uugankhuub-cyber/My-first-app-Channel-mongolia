
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const DEFAULT_PLACEHOLDER = '/placeholder-article.svg';

interface ThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = 'video',
  showOverlay = true,
  overlayContent 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!src || typeof src !== 'string' || !src.trim()) {
      return DEFAULT_PLACEHOLDER;
    }
    return src.trim();
  });

  useEffect(() => {
    if (!src || typeof src !== 'string' || !src.trim()) {
      setCurrentSrc(DEFAULT_PLACEHOLDER);
    } else {
      setCurrentSrc(src.trim());
    }
  }, [src]);

  // Exact aspect ratio enforcement for consistency
  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]'
  };

  const handleImageError = () => {
    if (currentSrc !== DEFAULT_PLACEHOLDER) {
      setCurrentSrc(DEFAULT_PLACEHOLDER);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-surfaceHighlight w-full ${aspectClasses[aspectRatio]} ${className}`}>
      {/* Skeleton / Loading State */}
      <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
         <ImageIcon className="text-slate-400 dark:text-slate-600 w-8 h-8 animate-pulse" />
      </div>

      {/* Actual Image with neutral Channel Mongolia fallback on error */}
      <img 
        src={currentSrc} 
        alt={alt || 'Channel Mongolia'} 
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
      />

      {/* Subtle Gradient Overlay - Adjusted to be lighter/more transparent for better Light Mode look */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none mix-blend-multiply"></div>
      )}

      {/* Overlay Content (e.g., play button, tags) */}
      {overlayContent && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {overlayContent}
        </div>
      )}
    </div>
  );
};
