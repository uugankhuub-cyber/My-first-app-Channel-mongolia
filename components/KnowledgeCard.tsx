
import React from 'react';
import { Clock, Eye, Play } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ContentItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Card } from './ui/Card';
import { Thumbnail } from './ui/Thumbnail';
import { motion } from 'motion/react';

const { Link } = ReactRouterDOM;

interface KnowledgeCardProps {
  item: ContentItem;
  featured?: boolean;
}

// SKELETON LOADER
export const KnowledgeCardSkeleton: React.FC<{ featured?: boolean }> = ({ featured }) => {
  return (
    <Card animate={false} className={`h-full flex flex-col overflow-hidden pointer-events-none ${featured ? 'md:flex-row md:min-h-[380px]' : ''}`}>
      <div className={`bg-slate-200 dark:bg-white/5 animate-pulse ${featured ? 'md:w-3/5 h-64 md:h-auto' : 'w-full aspect-video'}`} />
      <div className={`p-5 flex flex-col flex-1 space-y-4 ${featured ? 'md:w-2/5 md:p-8' : ''}`}>
        <div className="space-y-2">
           <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-3/4 animate-pulse" />
           {featured && <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-1/2 animate-pulse" />}
        </div>
        <div className="space-y-2">
           <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-full animate-pulse" />
           <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-5/6 animate-pulse" />
        </div>
        <div className="mt-auto flex items-center gap-3 pt-2">
           <div className="h-3 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
           <div className="h-3 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item, featured = false }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const title = (isEn ? item.title_en : item.title) || item.title || '';
  const description = (isEn ? item.description_en : item.description) || item.description || '';
  const category = (isEn ? item.category_en : item.category) || item.category || '';

  const OverlayContent = (
    <>
      {item.isVideo && (
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 shadow-lg border border-white/20"
          >
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </motion.div>
        </div>
      )}
      <div className="absolute top-3 left-3 pointer-events-auto">
         <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white tracking-wide border border-white/10 uppercase shadow-sm">
            {category}
         </span>
      </div>
    </>
  );

  return (
    <Link to={`/niitlel/${item.id}`} className="block h-full outline-none group focus-visible:ring-2 ring-brand-purple rounded-2xl">
      <Card 
        className={`h-full flex flex-col group-hover:shadow-card-hover ${featured ? 'md:flex-row md:min-h-[380px]' : ''}`}
        animate={true}
      >
        
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
          
          <h3 className={`font-bold text-text-main leading-snug mb-2 group-hover:text-brand-purple transition-colors duration-300 ${featured ? 'text-2xl md:text-3xl tracking-tight' : 'text-lg line-clamp-2'}`}>
            {title}
          </h3>
          
          <p className={`text-text-muted mb-4 line-clamp-2 leading-relaxed ${featured ? 'text-base md:text-lg mb-6' : 'text-sm'}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between text-xs text-text-muted font-medium uppercase tracking-wider">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <Eye size={14} />
                  <span>{(item.views ?? 0).toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{item.readTimeValue} {t('min_read')}</span>
               </div>
            </div>
          </div>
          
          {featured && (
             <div className="mt-8 hidden md:block">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-border text-text-main text-sm font-semibold group-hover:bg-brand-purple group-hover:text-white group-hover:border-transparent transition-all"
                >
                   {item.isVideo ? t('watch') : t('read')}
                </motion.span>
             </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
