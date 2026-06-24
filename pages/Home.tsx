
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { KnowledgeCard, KnowledgeCardSkeleton } from '../components/KnowledgeCard';
import { Sidebar } from '../components/Sidebar';
import { DailyKnowledge } from '../components/DailyKnowledge';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useContent } from '../context/ContentContext';
import { Container } from '../components/ui/Container';
import { motion, AnimatePresence } from 'motion/react';

const { Link } = ReactRouterDOM;

// Curated high-quality images for the hero slider
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Space/Science
  "https://images.unsplash.com/photo-1507842217121-ad959dc12246?q=80&w=2070&auto=format&fit=crop", // History/Library
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1948&auto=format&fit=crop", // Nature
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop", // Research
];

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const { getRecommendedCategory } = useUserPreferences();
  const { content: ALL_CONTENT, loading } = useContent(); 
  
  const recommendedSlug = getRecommendedCategory();
  
  const recommendedContent = recommendedSlug 
    ? ALL_CONTENT.filter(c => c.category === CATEGORIES.find(cat => cat.slug === recommendedSlug)?.label)
    : [];
    
  const latestContent = ALL_CONTENT.filter(c => !recommendedContent.includes(c)).slice(0, 4);
  const featuredContent = ALL_CONTENT[0];
  const trendingContent = ALL_CONTENT.slice(3, 6);

  // Hero Slider State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 8000); // Change slide every 8 seconds
    return () => clearInterval(interval);
  }, []);
  
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-24 bg-background transition-colors duration-500">
      {/* Hero / Header Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-border">
        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-sm mb-8"
            >
              <Sparkles size={16} className="text-brand-orange" />
              <span className="text-sm font-semibold text-gradient">
                Шинэ үеийн мэдлэгийн сан
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black text-text-main mb-6 leading-[1.1] tracking-tight">
              {t('hero_title')} <br className="hidden md:block"/>
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-white px-6 py-2 bg-gradient-brand rounded-2xl transform -rotate-2 inline-block shadow-lg">
                  {t('hero_title_highlight')}
                </span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('hero_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Link to="/categories" className="w-full sm:w-auto px-8 py-4 bg-text-main text-background font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
                    Мэдлэгтэй танилцах <ArrowRight size={20} />
                 </Link>
               </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      <Container className="mt-8 md:mt-12">
        
        <div className="lg:hidden mb-12">
             <DailyKnowledge />
        </div>

        {/* Featured Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
           <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-10 bg-gradient-brand rounded-full"></div>
             <h2 className="text-3xl md:text-4xl font-black text-text-main tracking-tight uppercase italic">{t('featured')}</h2>
           </div>
           {loading ? (
             <KnowledgeCardSkeleton featured={true} />
           ) : (
             featuredContent && <KnowledgeCard item={featuredContent} featured={true} />
           )}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feed (2/3) -> col-span-8 */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* PERSONALIZED FEED */}
            {!loading && recommendedContent.length > 0 && (
                <motion.section
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple shadow-inner">
                        <Sparkles size={24} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-text-main tracking-tight">{t('recommended_for_you')}</h2>
                        <p className="text-sm text-text-muted font-medium uppercase tracking-widest">{t('recommended_desc')}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {recommendedContent.map(item => (
                      <motion.div key={item.id} variants={itemVariants}>
                        <KnowledgeCard item={item} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
            )}

            {/* Latest Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-8 bg-brand-purple rounded-full"></div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">{t('latest')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <KnowledgeCardSkeleton key={i} />)
                ) : (
                  latestContent.map(item => (
                    <motion.div key={item.id} variants={itemVariants}>
                      <KnowledgeCard item={item} />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

            {/* Ad Placeholder - Styled as a Premium Banner */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="w-full h-40 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900/50 dark:to-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>
                <span className="relative z-10 text-text-muted font-black text-xs tracking-[0.3em] uppercase opacity-50 mb-2">{t('ad_space')}</span>
                <p className="relative z-10 text-text-main font-medium text-sm">Premium Content Partnership</p>
            </motion.div>

            {/* Trending Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shadow-inner">
                      <TrendingUp size={24} />
                   </div>
                   <h2 className="text-2xl font-bold text-text-main tracking-tight">{t('trending')}</h2>
                </div>
                <Link to="/categories" className="flex items-center text-brand-purple hover:text-brand-orange font-bold text-sm transition-all group">
                   <span className="mr-2">{t('view_all')}</span>
                   <div className="w-8 h-8 rounded-full border border-brand-purple/20 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                   </div>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <KnowledgeCardSkeleton key={i} />)
                ) : (
                  trendingContent.map(item => (
                    <motion.div key={item.id} variants={itemVariants}>
                      <KnowledgeCard item={item} />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

          </div>

          {/* Sidebar (1/3) -> col-span-4 */}
          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-24 space-y-12 pb-24">
                <Sidebar />
             </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
