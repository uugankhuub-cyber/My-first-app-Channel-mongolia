
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
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          <ImageIcon className="text-gray-300 dark:text-gray-600 w-8 h-8" />
        </div>
      )}

      {/* Actual Image */}
      {!hasError ? (
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surfaceHighlight text-text-muted text-sm">
           <span>Image unavailable</span>
        </div>
      )}

      {/* Subtle Gradient Overlay - ensuring text readability without washing out image */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent pointer-events-none"></div>
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
