
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { KnowledgeCard, KnowledgeCardSkeleton } from '../components/KnowledgeCard';
import { Sidebar } from '../components/Sidebar';
import { DailyKnowledge } from '../components/DailyKnowledge';
import { ArrowRight, Sparkles } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useContent } from '../context/ContentContext';
import { Container } from '../components/ui/Container';

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
  
  return (
    <div className="pb-24 bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      {/* Hero / Header Section */}
      <section className="relative min-h-[420px] md:min-h-[520px] flex flex-col justify-center overflow-hidden">
        
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt=""
                className={`w-full h-full object-cover transform transition-transform duration-[12000ms] ease-linear ${
                  index === currentHeroIndex ? 'scale-110' : 'scale-100'
                }`}
              />
            </div>
          ))}
          
          {/* DUAL MODE OVERLAY: Clean White for Light Mode, Cinematic Black for Dark Mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/60 to-white/90 dark:from-black/80 dark:via-black/50 dark:to-black/80 transition-colors duration-500"></div>
        </div>
        
        <Container className="relative z-10 text-center py-14 md:py-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight drop-shadow-sm dark:drop-shadow-lg transition-colors duration-300">
            {t('hero_title')} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-purple">
              {t('hero_title_highlight')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light mb-8 transition-colors duration-300">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center">
             <Link to="/categories" className="px-6 py-2.5 bg-gradient-brand text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                <span>{t('view_all')}</span>
                <ArrowRight size={16} />
             </Link>
          </div>
        </Container>
      </section>

      <Container className="mt-8 md:mt-12">
        
        <div className="lg:hidden mb-12">
             <DailyKnowledge />
        </div>

        {/* Featured Section */}
        <section className="mb-20">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-1 h-8 bg-gradient-brand rounded-full"></div>
             <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">{t('featured')}</h2>
           </div>
           {loading ? (
             <KnowledgeCardSkeleton featured={true} />
           ) : (
             featuredContent && <KnowledgeCard item={featuredContent} featured={true} />
           )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed (2/3) -> col-span-8 */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* PERSONALIZED FEED */}
            {!loading && recommendedContent.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                        <Sparkles size={20} />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-text-main">{t('recommended_for_you')}</h2>
                        <p className="text-sm text-text-muted">{t('recommended_desc')}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedContent.map(item => (
                      <KnowledgeCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
            )}

            {/* Latest Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-brand-purple rounded-full"></div>
                <h2 className="text-xl font-bold text-text-main">{t('latest')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <KnowledgeCardSkeleton key={i} />)
                ) : (
                  latestContent.map(item => (
                    <KnowledgeCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </section>

            {/* Ad Placeholder */}
            <div className="w-full h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                <span className="text-text-muted font-medium text-sm tracking-widest uppercase opacity-70">{t('ad_space')}</span>
            </div>

            {/* Trending Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-6 bg-brand-orange rounded-full"></div>
                   <h2 className="text-xl font-bold text-text-main">{t('trending')}</h2>
                </div>
                <Link to="/categories" className="flex items-center text-brand-purple hover:text-brand-orange font-semibold text-sm transition-colors group">
                   {t('view_all')} <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <KnowledgeCardSkeleton key={i} />)
                ) : (
                  trendingContent.map(item => (
                    <KnowledgeCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Sidebar (1/3) -> col-span-4 */}
          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-24 space-y-8">
                <Sidebar />
             </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
