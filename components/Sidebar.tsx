
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Flame, Eye, Bookmark, Clock, Quote as QuoteIcon } from 'lucide-react';
import { CATEGORIES, QUOTES } from '../constants';
import { useContent } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import { DailyKnowledge } from './DailyKnowledge';
import { ContentItem } from '../types';
import { Card } from './ui/Card';
import { Thumbnail } from './ui/Thumbnail';

const { Link } = ReactRouterDOM;

export const Sidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const { content } = useContent(); 
  const isEn = language === 'en';

  const mostViewed = [...content].sort((a, b) => b.views - a.views).slice(0, 5);
  const trending = content.filter(c => c.isTrending).slice(0, 5);
  const editorsPick = content.filter(c => c.isEditorPick).slice(0, 3);
  const todaysQuote = QUOTES[0];

  const SidebarHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <h3 className="flex items-center gap-2 font-bold text-text-main mb-4 text-xs uppercase tracking-wider pl-1 border-l-2 border-brand-purple">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
  );

  const CompactContentItem: React.FC<{ item: ContentItem; rank?: number; showImage?: boolean; metaIcon?: React.ReactNode; metaText?: string }> = ({ 
    item, rank, showImage = true, metaIcon, metaText 
  }) => {
    const title = isEn ? item.title_en : item.title;
    
    return (
      <Link to={`/niitlel/${item.id}`} className="group flex gap-3 items-start p-2 rounded-xl hover:bg-surfaceHighlight transition-colors">
        {showImage && (
          <div className="relative w-16 h-12 flex-shrink-0">
             <Thumbnail 
                src={item.thumbnailUrl} 
                alt={title} 
                aspectRatio="video" 
                className="rounded-lg h-full w-full"
                showOverlay={false}
             />
             {rank && (
               <div className={`absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-sm ${rank === 1 ? 'bg-brand-orange' : 'bg-brand-surface'}`}>
                 {rank}
               </div>
             )}
          </div>
        )}
        <div className="flex-1 min-w-0 py-0.5">
          <h4 className="font-medium text-sm text-text-main group-hover:text-brand-purple transition-colors leading-snug line-clamp-2">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
             {metaIcon}
             <span>{metaText}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <aside className="space-y-8 sticky top-24">
      
      <DailyKnowledge />

      {/* BLOCK 1: MOST VIEWED */}
      <Card className="p-5">
        <SidebarHeader title={t('sb_most_viewed')} icon={<Eye size={16} className="text-brand-purple" />} />
        <div className="space-y-1">
          {mostViewed.map((item, idx) => (
            <CompactContentItem 
              key={item.id} 
              item={item} 
              rank={idx + 1} 
              metaIcon={<Eye size={10} />}
              metaText={`${(item.views / 1000).toFixed(1)}k`}
            />
          ))}
        </div>
      </Card>

      {/* BLOCK 2: TRENDING */}
      <Card className="p-5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        <SidebarHeader title={t('sb_trending')} icon={<Flame size={16} className="text-brand-orange" />} />
        <div className="space-y-3 relative z-10">
           {trending.map(item => (
              <CompactContentItem 
                key={item.id} 
                item={item} 
                metaIcon={<Clock size={10} />}
                metaText="2h ago"
              />
           ))}
        </div>
      </Card>

      {/* BLOCK 3: EDITOR'S PICK */}
      <div>
         <SidebarHeader title={t('sb_editors_pick')} icon={<Bookmark size={16} className="text-brand-purple" />} />
         <div className="space-y-4">
            {editorsPick.map(item => {
               const title = isEn ? item.title_en : item.title;
               return (
                <Link key={item.id} to={`/niitlel/${item.id}`} className="block group">
                  <div className="relative rounded-xl overflow-hidden mb-2 shadow-sm border border-border">
                     <Thumbnail 
                        src={item.thumbnailUrl} 
                        alt={title} 
                        className="group-hover:scale-105 transition-transform duration-700" 
                     />
                     <div className="absolute bottom-2 left-2">
                        <span className="px-1.5 py-0.5 bg-brand-purple/90 backdrop-blur-sm rounded text-[10px] font-bold text-white tracking-wide">PICK</span>
                     </div>
                  </div>
                  <h4 className="font-bold text-sm text-text-main group-hover:text-brand-purple transition-colors leading-snug">
                     {title}
                  </h4>
                </Link>
               )
            })}
         </div>
      </div>

      {/* BLOCK 5: CATEGORY JUMP */}
      <Card className="p-5">
         <SidebarHeader title={t('sb_categories')} />
         <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
               <Link 
                 key={cat.id} 
                 to={`/${cat.slug}`}
                 className="px-3 py-1.5 bg-surfaceHighlight hover:bg-brand-purple text-text-muted hover:text-white rounded-lg text-xs font-semibold transition-all"
               >
                 {cat.label}
               </Link>
            ))}
         </div>
      </Card>
      
       {/* QUOTE */}
      <Card className="p-6 text-center bg-gradient-to-br from-surface to-surfaceHighlight">
         <QuoteIcon size={32} className="text-brand-purple/20 mx-auto mb-3" />
         <h3 className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-3">{t('sb_quote')}</h3>
         <blockquote className="text-text-main font-serif italic text-lg leading-relaxed mb-4">
            "{isEn ? todaysQuote.text_en : todaysQuote.text}"
         </blockquote>
         <div className="w-6 h-0.5 bg-brand-purple/30 mx-auto mb-2"></div>
         <cite className="text-xs text-text-muted font-bold not-italic uppercase">{todaysQuote.author}</cite>
      </Card>

    </aside>
  );
};
