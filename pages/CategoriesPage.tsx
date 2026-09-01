
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useContent } from '../context/ContentContext';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { Filter, Grid, List as ListIcon, FolderOpen, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const { useNavigate } = ReactRouterDOM;

interface CategoriesPageProps {
    categorySlug?: string;
    filter?: string; 
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categorySlug, filter }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { content } = useContent(); // Dynamic Content
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [videoChip, setVideoChip] = useState<string>('all');

  const activeSlug = categorySlug || filter || 'all';

  const handleFilterChange = (slug: string) => {
    if (slug === 'all') navigate('/categories');
    else navigate(`/${slug}`);
  };

  const activeCategoryLabel = (() => {
      if (activeSlug === 'all') return t('all_knowledge');
      if (activeSlug === 'video') return t('video_knowledge');
      return CATEGORIES.find(c => c.slug === activeSlug)?.label || t('nav_categories');
  })();

  const filteredContent = (() => {
      if (activeSlug === 'all') return content;
      if (activeSlug === 'video') return content.filter(c => c.isVideo);
      
      const catObj = CATEGORIES.find(cat => cat.slug === activeSlug);
      return catObj 
         ? content.filter(c => c.category === catObj.label || c.category_en === catObj.label_en)
         : content;
  })();

  // Sub-tags for Video Pills
  const videoChips = [
    { id: 'all', label: 'Бүгд', label_en: 'All' },
    { id: 'space', label: 'Сансар & Физик', label_en: 'Space & Physics' },
    { id: 'ai', label: 'Хиймэл оюун', label_en: 'AI & Robots' },
    { id: 'history', label: 'Түүх', label_en: 'History' },
    { id: 'animals', label: 'Амьтан & Байгаль', label_en: 'Nature' },
  ];

  const finalContent = (() => {
    let items = filteredContent;
    if (activeSlug === 'video' && videoChip !== 'all') {
      if (videoChip === 'space') {
        items = items.filter(item => 
          (item.tags || []).includes('Сансар') || 
          (item.tags || []).includes('Физик') || 
          (item.tags_en || []).includes('Space') || 
          (item.tags_en || []).includes('Physics')
        );
      } else if (videoChip === 'ai') {
        items = items.filter(item => 
          (item.tags || []).includes('AI') || 
          (item.tags || []).includes('Робот') || 
          (item.tags_en || []).includes('AI') || 
          (item.tags_en || []).includes('Robots')
        );
      } else if (videoChip === 'history') {
        items = items.filter(item => 
          (item.tags || []).includes('Түүх') || 
          (item.tags_en || []).includes('History')
        );
      } else if (videoChip === 'animals') {
        items = items.filter(item => 
          (item.tags || []).includes('Амьтад') || 
          (item.tags || []).includes('Байгаль') || 
          (item.tags_en || []).includes('Animals') || 
          (item.tags_en || []).includes('Nature')
        );
      }
    }
    return items;
  })();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // YOUTUBE CINEMATIC INTERFACE FOR VIDEOS
  if (activeSlug === 'video') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 transition-colors duration-500">
        <Container>
          {/* YouTube Branding Header */}
          <div className="border-b border-white/5 pb-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                  <Play size={24} fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                    {activeCategoryLabel}
                  </h1>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mt-0.5">Premium Media Hub</p>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 text-slate-300 w-fit">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold">{finalContent.length} Нэвтрүүлэг бэлэн байна</span>
              </div>
            </div>

            {/* YouTube Category Chips Row */}
            <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
              {videoChips.map((chip) => {
                const isSelected = videoChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setVideoChip(chip.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                      isSelected
                        ? "bg-text-main text-background shadow-lg"
                        : "bg-white/10 text-slate-300 hover:bg-white/15"
                    )}
                  >
                    {language === 'en' ? chip.label_en : chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Videos Grid - YouTube Home Style */}
          <AnimatePresence mode="wait">
            {finalContent.length > 0 ? (
              <motion.div
                key={videoChip}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
              >
                {finalContent.map((item) => {
                  const title = language === 'en' ? item.title_en : item.title;
                  return (
                    <motion.div key={item.id} variants={itemVariants}>
                      <ReactRouterDOM.Link 
                        to={`/niitlel/${item.id}`} 
                        className="group/yt block space-y-3"
                      >
                        {/* Thumbnail card with Hover effect */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
                          <img 
                            src={item.thumbnailUrl} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/yt:scale-105"
                          />
                          
                          {/* Duration Stamp */}
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                            {item.readTimeValue ? `${item.readTimeValue}:00` : '3:45'}
                          </div>

                          {/* Red YouTube Hover Play Button */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/yt:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[1px]">
                            <motion.div
                              whileHover={{ scale: 1.15 }}
                              className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-600/30 border border-red-500"
                            >
                              <Play size={20} fill="currentColor" className="ml-1" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Title and Channel details */}
                        <div className="flex gap-3 px-1">
                          {/* Circular Channel Badge mimicking YouTube channel logo */}
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10 uppercase">
                            CM
                          </div>

                          {/* Video details */}
                          <div className="space-y-1 flex-1">
                            <h3 className="font-bold text-sm text-slate-100 group-hover/yt:text-red-500 line-clamp-2 leading-snug transition-colors duration-200">
                              {title}
                            </h3>
                            
                            <div className="text-xs text-slate-400 font-medium space-y-0.5">
                              <p className="hover:text-slate-200 transition-colors">Channel Mongolia</p>
                              <p className="flex items-center gap-1.5 font-mono">
                                <span>{(item.views ?? 0).toLocaleString()} үзсэн</span>
                                <span>•</span>
                                <span>{item.publishedDate}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </ReactRouterDOM.Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state-video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                  <Play size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Бичлэг олдсонгүй</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Энэ ангилалд тохирох видео контент байхгүй байна.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>
    );
  }

  // STANDARD LAYOUT FOR NON-VIDEO CATEGORIES
  return (
    <Container className="py-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-text-main drop-shadow-sm dark:drop-shadow-md"
        >
          {activeCategoryLabel}
        </motion.h1>
        
        <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted font-medium hidden sm:block">{t('sort_by')}</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surfaceHighlight text-text-main transition-colors focus-visible:ring-2 ring-brand-purple">
                <Filter size={16} />
                <span>{t('newest')}</span>
            </button>
            <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>
            <div className="hidden sm:flex bg-surface border border-border rounded-lg p-1">
               <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded transition-colors", viewMode === 'grid' ? 'bg-brand-purple text-white shadow-sm' : 'text-text-muted hover:text-text-main')}>
                  <Grid size={16} />
               </button>
               <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded transition-colors", viewMode === 'list' ? 'bg-brand-purple text-white shadow-sm' : 'text-text-muted hover:text-text-main')}>
                  <ListIcon size={16} />
               </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
                <h3 className="font-bold text-text-main mb-4 px-2 text-xs uppercase tracking-wider opacity-70">{t('nav_categories')}</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          activeSlug === 'all' 
                            ? 'bg-brand-purple text-white shadow-md' 
                            : 'text-text-muted hover:bg-surfaceHighlight hover:text-text-main'
                        )}
                    >
                        {t('all_knowledge')}
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange(cat.slug)}
                            className={cn(
                              "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                              activeSlug === cat.slug 
                                ? 'bg-brand-purple text-white shadow-md' 
                                : 'text-text-muted hover:bg-surfaceHighlight hover:text-text-main'
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </Card>
        </div>

        <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {finalContent.length > 0 ? (
                  <motion.div 
                    key={activeSlug + viewMode}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "grid gap-8",
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                    )}
                  >
                      {finalContent.map(item => (
                          <motion.div key={item.id} variants={itemVariants}>
                            <KnowledgeCard item={item} />
                          </motion.div>
                      ))}
                  </motion.div>
              ) : (
                  <motion.div 
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-24 text-center bg-surface rounded-2xl border border-dashed border-border flex flex-col items-center justify-center"
                  >
                      <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center text-text-muted mb-4">
                         <FolderOpen size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-text-main mb-1">Хоосон байна</h3>
                      <p className="text-text-muted max-w-sm mx-auto">{t('no_results')}</p>
                  </motion.div>
              )}
            </AnimatePresence>
        </div>

      </div>
    </Container>
  );
};
