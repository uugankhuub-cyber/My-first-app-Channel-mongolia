
import React from 'react';
import { PlayCircle, Clock, Eye, Play } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ContentItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Card } from './ui/Card';
import { Thumbnail } from './ui/Thumbnail';

const { Link } = ReactRouterDOM;

interface KnowledgeCardProps {
  item: ContentItem;
  featured?: boolean;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item, featured = false }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const title = isEn ? item.title_en : item.title;
  const description = isEn ? item.description_en : item.description;
  const category = isEn ? item.category_en : item.category;

  const OverlayContent = (
    <>
      {item.isVideo && (
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/90 shadow-sm border border-white/10">
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      )}
      <div className="absolute top-3 left-3 pointer-events-auto">
         <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white tracking-wide border border-white/10 uppercase">
            {category}
         </span>
      </div>
    </>
  );

  return (
    <Link to={`/niitlel/${item.id}`} className="block h-full">
      <Card className={`h-full flex flex-col group ${featured ? 'md:flex-row md:min-h-[380px]' : ''}`}>
        
        {/* Thumbnail Section */}
        <div className={`relative overflow-hidden ${featured ? 'md:w-3/5 h-64 md:h-auto' : 'w-full'}`}>
          <Thumbnail 
            src={item.thumbnailUrl} 
            alt={title} 
            aspectRatio={featured ? 'wide' : 'video'}
            className="h-full w-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
            overlayContent={OverlayContent}
            showOverlay={true}
          />
        </div>

        {/* Content Section */}
        <div className={`p-5 flex flex-col flex-1 ${featured ? 'md:w-2/5 md:justify-center md:p-8' : ''}`}>
          
          <h3 className={`font-bold text-text-main leading-snug mb-2 group-hover:text-brand-purple transition-colors duration-300 ${featured ? 'text-2xl md:text-3xl' : 'text-lg line-clamp-2'}`}>
            {title}
          </h3>
          
          <p className={`text-text-muted mb-4 line-clamp-2 leading-relaxed ${featured ? 'text-base md:text-lg mb-6' : 'text-sm'}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between text-xs text-text-muted font-medium uppercase tracking-wider">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <Eye size={14} />
                  <span>{item.views.toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{item.readTimeValue} {t('min_read')}</span>
               </div>
            </div>
          </div>
          
          {featured && (
             <div className="mt-8 hidden md:block">
                <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-border text-text-main text-sm font-semibold group-hover:bg-brand-purple group-hover:text-white group-hover:border-transparent transition-all">
                   {item.isVideo ? t('watch') : t('read')}
                </span>
             </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
