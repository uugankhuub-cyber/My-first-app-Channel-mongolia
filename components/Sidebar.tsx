
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Flame, Eye, Bookmark, Clock, Quote as QuoteIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, QUOTES } from '../constants';
import { useContent } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import { DailyKnowledge } from './DailyKnowledge';
import { ContentItem } from '../types';
import { Card } from './ui/Card';
import { Thumbnail } from './ui/Thumbnail';
import { cn } from '../lib/utils';

const { Link } = ReactRouterDOM;

export const Sidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const { content, loading } = useContent(); 
  const isEn = language === 'en';

  const mostViewed = [...content].sort((a, b) => b.views - a.views).slice(0, 5);
  const trending = content.filter(c => c.isTrending).slice(0, 5);
  const editorsPick = content.filter(c => c.isEditorPick).slice(0, 3);
  const todaysQuote = QUOTES[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const SidebarHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <motion.h3 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-2 font-bold text-text-main mb-4 text-xs uppercase tracking-wider pl-1 border-l-2 border-brand-purple"
    >
      {icon}
      <span className="ml-2">{title}</span>
    </motion.h3>
  );

  const CompactSkeleton = () => (
    <div className="flex gap-3 items-start p-2 animate-pulse">
       <div className="w-16 h-12 bg-slate-200 dark:bg-white/5 rounded-lg flex-shrink-0" />
       <div className="flex-1 space-y-2 py-1">
          <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
          <div className="h-2 bg-slate-200 dark:bg-white/5 rounded w-1/2" />
       </div>
    </div>
  );

  const CompactContentItem: React.FC<{ item: ContentItem; rank?: number; showImage?: boolean; metaIcon?: React.ReactNode; metaText?: string }> = ({ 
    item, rank, showImage = true, metaIcon, metaText 
  }) => {
    const title = isEn ? item.title_en : item.title;
    
    return (
      <motion.div variants={itemVariants}>
        <Link to={`/niitlel/${item.id}`} className="group flex gap-3 items-start p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple">
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
                 <div className={cn(
                   "absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-sm",
                   rank === 1 ? 'bg-brand-orange' : 'bg-brand-surface'
                 )}>
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
      </motion.div>
    );
  };

  return (
    <aside className="space-y-8 relative">
      
      <DailyKnowledge />

      {/* BLOCK 1: MOST VIEWED - TINTED */}
      <Card className="p-5" variant="tinted">
        <SidebarHeader title={t('sb_most_viewed')} icon={<Eye size={16} className="text-brand-purple" />} />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-1"
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CompactSkeleton key={i} />)
          ) : (
            mostViewed.map((item, idx) => (
              <CompactContentItem 
                key={item.id} 
                item={item} 
                rank={idx + 1} 
                metaIcon={<Eye size={10} />}
                metaText={`${(item.views / 1000).toFixed(1)}k`}
              />
            ))
          )}
        </motion.div>
      </Card>

      {/* BLOCK 2: TRENDING - DEFAULT WHITE/SURFACE */}
      <Card className="p-5 overflow-hidden relative">
        <SidebarHeader title={t('sb_trending')} icon={<Flame size={16} className="text-brand-orange" />} />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3 relative z-10"
        >
           {loading ? (
             Array.from({ length: 3 }).map((_, i) => <CompactSkeleton key={i} />)
           ) : (
             trending.map(item => (
                <CompactContentItem 
                  key={item.id} 
                  item={item} 
                  metaIcon={<Clock size={10} />}
                  metaText="2h ago"
                />
             ))
           )}
        </motion.div>
      </Card>

      {/* BLOCK 3: EDITOR'S PICK */}
      <div>
         <SidebarHeader title={t('sb_editors_pick')} icon={<Bookmark size={16} className="text-brand-purple" />} />
         <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="space-y-4"
         >
            {loading ? (
               Array.from({ length: 2 }).map((_, i) => (
                 <div key={i} className="rounded-xl overflow-hidden mb-2 animate-pulse">
                    <div className="h-32 bg-slate-200 dark:bg-white/5 w-full mb-2" />
                    <div className="h-4 bg-slate-200 dark:bg-white/5 w-3/4" />
                 </div>
               ))
            ) : (
               editorsPick.map(item => {
                  const title = isEn ? item.title_en : item.title;
                  return (
                   <motion.div key={item.id} variants={itemVariants}>
                     <Link to={`/niitlel/${item.id}`} className="block group outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl">
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
                   </motion.div>
                  )
               })
            )}
         </motion.div>
      </div>

      {/* BLOCK 5: CATEGORY JUMP - TINTED */}
      <Card className="p-5" variant="tinted">
         <SidebarHeader title={t('sb_categories')} />
         <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="flex flex-wrap gap-2"
         >
            {CATEGORIES.map(cat => (
               <motion.div key={cat.id} variants={itemVariants}>
                 <Link 
                   to={`/${cat.slug}`}
                   className="px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-brand-purple border border-slate-200 dark:border-white/10 text-text-muted hover:text-white rounded-lg text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-brand-purple"
                 >
                   {cat.label}
                 </Link>
               </motion.div>
            ))}
         </motion.div>
      </Card>
      
       {/* QUOTE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="p-6 text-center bg-gradient-to-br from-white to-slate-100 dark:from-surface dark:to-surfaceHighlight">
           <QuoteIcon size={32} className="text-brand-purple/20 mx-auto mb-3" />
           <h3 className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-3">{t('sb_quote')}</h3>
           <blockquote className="text-text-main font-serif italic text-lg leading-relaxed mb-4">
              "{isEn ? todaysQuote.text_en : todaysQuote.text}"
           </blockquote>
           <div className="w-6 h-0.5 bg-brand-purple/30 mx-auto mb-2"></div>
           <cite className="text-xs text-text-muted font-bold not-italic uppercase">{todaysQuote.author}</cite>
        </Card>
      </motion.div>

    </aside>
  );
};
