import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye, Bookmark, Clock, Quote as QuoteIcon } from 'lucide-react';
import { MOCK_CONTENT, CATEGORIES, QUOTES } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { DailyKnowledge } from './DailyKnowledge';
import { ContentItem } from '../types';

export const Sidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // --- DATA PROCESSING ---
  const mostViewed = [...MOCK_CONTENT].sort((a, b) => b.views - a.views).slice(0, 5);
  const trending = MOCK_CONTENT.filter(c => c.isTrending).slice(0, 5);
  const editorsPick = MOCK_CONTENT.filter(c => c.isEditorPick).slice(0, 3);
  const latest = [...MOCK_CONTENT].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()).slice(0, 4);
  const todaysQuote = QUOTES[0];

  // --- SUB-COMPONENTS ---

  const SidebarHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider pl-1">
      {icon}
      {title}
    </h3>
  );

  const CompactContentItem: React.FC<{ item: ContentItem; rank?: number; showImage?: boolean; metaIcon?: React.ReactNode; metaText?: string }> = ({ 
    item, rank, showImage = true, metaIcon, metaText 
  }) => {
    const title = isEn ? item.title_en : item.title;
    
    return (
      <Link to={`/niitlel/${item.id}`} className="group flex gap-3 items-start p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
        {showImage && (
          <div className={`relative flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-white/5 ${rank === 1 ? 'w-24 h-16 shadow-md' : 'w-16 h-12'}`}>
            <img src={item.thumbnailUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            
            {/* TOP Badge for #1 */}
            {rank === 1 && (
               <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-gradient-brand rounded-br-lg text-[10px] font-bold text-white shadow-sm">
                 TOP
               </div>
            )}
            {rank && rank > 1 && (
               <div className="absolute top-0 left-0 w-5 h-5 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white rounded-br-lg">
                 {rank}
               </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-gray-700 dark:text-slate-300 group-hover:text-brand-purple dark:group-hover:text-primary-300 transition-colors leading-snug line-clamp-2 ${rank === 1 ? 'text-sm font-bold text-gray-900 dark:text-white' : 'text-xs'}`}>
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-medium">
             {metaIcon}
             <span>{metaText}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <aside className="space-y-10 sticky top-24">
      
      {/* FEATURE 2: DAILY KNOWLEDGE (Replaces FactBox) */}
      <div>
         <DailyKnowledge />
      </div>

      {/* BLOCK 1: MOST VIEWED */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:shadow-none">
        <SidebarHeader title={t('sb_most_viewed')} icon={<Eye size={16} className="text-brand-purple" />} />
        <div className="space-y-2">
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
      </div>

      {/* BLOCK 2: TRENDING */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-brand-orange/20 transition-colors"></div>
        <SidebarHeader title={t('sb_trending')} icon={<Flame size={16} className="text-brand-orange" />} />
        <div className="space-y-4 relative z-10">
           {trending.map(item => (
              <CompactContentItem 
                key={item.id} 
                item={item} 
                metaIcon={<Clock size={10} />}
                metaText="2h ago"
              />
           ))}
        </div>
      </div>

      {/* BLOCK 3: EDITOR'S PICK */}
      <div>
         <SidebarHeader title={t('sb_editors_pick')} icon={<Bookmark size={16} className="text-brand-purple" />} />
         <div className="space-y-5">
            {editorsPick.map(item => {
               const title = isEn ? item.title_en : item.title;
               return (
                <Link key={item.id} to={`/niitlel/${item.id}`} className="block group">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 mb-3 shadow-sm">
                     <img src={item.thumbnailUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent"></div>
                     <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-brand-purple/90 backdrop-blur-sm rounded text-[10px] font-bold text-white tracking-wide">EDITOR'S PICK</span>
                     </div>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-brand-purple dark:group-hover:text-primary-300 transition-colors leading-snug">
                     {title}
                  </h4>
                </Link>
               )
            })}
         </div>
      </div>

      {/* BLOCK 5: CATEGORY JUMP */}
      <div className="bg-white dark:bg-brand-surface rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-soft dark:shadow-none">
         <SidebarHeader title={t('sb_categories')} />
         <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
               <Link 
                 key={cat.id} 
                 to={`/${cat.slug}`}
                 className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gradient-brand text-gray-600 dark:text-slate-400 hover:text-white border border-gray-200 dark:border-white/5 hover:border-transparent rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
               >
                 {cat.label}
               </Link>
            ))}
         </div>
      </div>
      
       {/* BLOCK 10: QUOTE OF THE DAY */}
      <div className="relative p-8 text-center rounded-2xl border border-gray-100 dark:border-white/5 bg-gradient-to-br from-white to-gray-50 dark:from-brand-surface dark:to-[#020617] overflow-hidden group shadow-soft dark:shadow-none">
         <QuoteIcon size={48} className="text-gray-100 dark:text-white/5 absolute top-4 left-4" />
         <h3 className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-4 relative z-10 opacity-80">{t('sb_quote')}</h3>
         <blockquote className="text-gray-800 dark:text-slate-200 font-serif italic text-lg leading-relaxed mb-4 relative z-10">
            "{isEn ? todaysQuote.text_en : todaysQuote.text}"
         </blockquote>
         <div className="w-8 h-1 bg-gradient-brand mx-auto mb-3 rounded-full opacity-50"></div>
         <cite className="text-xs text-gray-500 dark:text-slate-500 font-bold not-italic relative z-10 uppercase tracking-wide">{todaysQuote.author}</cite>
      </div>

    </aside>
  );
};