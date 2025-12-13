import React from 'react';
import { PlayCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

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

  return (
    <Link to={`/niitlel/${item.id}`} className="group block h-full relative">
      {/* Gradient Border Reveal Wrapper */}
      <div className={`absolute -inset-[1px] bg-gradient-brand rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]`}></div>
      
      <div className={`relative h-full flex flex-col bg-white dark:bg-brand-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-100 dark:border-white/5 group-hover:border-transparent ${featured ? 'md:flex-row md:items-stretch min-h-[400px]' : ''}`}>
        
        {/* Thumbnail Container */}
        <div className={`relative overflow-hidden ${featured ? 'md:w-2/3 h-64 md:h-auto' : 'h-52 w-full'}`}>
          <img 
            src={item.thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          
          {item.isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 group-hover:bg-gradient-brand group-hover:border-transparent transition-all duration-300 shadow-lg">
                <PlayCircle size={28} fill="currentColor" className="opacity-100" />
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4">
             <span className="px-3 py-1 bg-white/90 dark:bg-[#020617]/80 backdrop-blur-md border border-gray-100 dark:border-white/10 rounded-full text-xs font-bold text-gray-900 dark:text-white tracking-wide shadow-sm">
                {category}
             </span>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 flex flex-col flex-1 ${featured ? 'md:w-1/3 md:justify-center md:p-8' : ''}`}>
          <h3 className={`font-bold text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-brand transition-all duration-300 ${featured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-lg line-clamp-2'}`}>
            {title}
          </h3>
          
          <p className={`text-gray-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed ${featured ? 'text-base md:text-lg' : 'text-sm'}`}>
            {description}
          </p>

          <div className="mt-auto flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Eye size={14} />
              <span>{item.views.toLocaleString()} {t('views')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{item.readTimeValue} {t('min_read')}</span>
            </div>
          </div>
          
          {featured && (
             <div className="mt-8 hidden md:block">
                <span className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white text-sm font-semibold group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white transition-all">
                   {item.isVideo ? t('watch') : t('read')}
                </span>
             </div>
          )}
        </div>
      </div>
    </Link>
  );
};