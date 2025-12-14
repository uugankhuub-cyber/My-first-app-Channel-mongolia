
import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ThumbnailProps {
  src: string;
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
  const [hasError, setHasError] = useState(false);

  // Exact aspect ratio enforcement for consistency
  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]'
  };

  return (
    <div className={`relative overflow-hidden bg-surfaceHighlight w-full ${aspectClasses[aspectRatio]} ${className}`}>
      {/* Skeleton / Loading State */}
      <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
         {!hasError && <ImageIcon className="text-gray-300 dark:text-gray-600 w-8 h-8 animate-pulse" />}
      </div>

      {/* Actual Image */}
      {!hasError ? (
        <img 
          src={src} 
          alt={alt} 
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surfaceHighlight text-text-muted text-sm flex-col gap-2">
           <ImageIcon size={20} className="opacity-50" />
           <span className="text-xs">Unavailable</span>
        </div>
      )}

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
