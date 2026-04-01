
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { useContent } from '../context/ContentContext';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { Filter, Grid, List as ListIcon, FolderOpen } from 'lucide-react';
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
              {filteredContent.length > 0 ? (
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
                      {filteredContent.map(item => (
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
