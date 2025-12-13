import React from 'react';
import { CATEGORIES, MOCK_CONTENT } from '../constants';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { Sidebar } from '../components/Sidebar';
import { DailyKnowledge } from '../components/DailyKnowledge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '../context/LanguageContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const { getRecommendedCategory } = useUserPreferences();
  
  // Logic for feeds
  const recommendedSlug = getRecommendedCategory();
  
  // If we have a recommendation, we show that content first
  const recommendedContent = recommendedSlug 
    ? MOCK_CONTENT.filter(c => c.category === CATEGORIES.find(cat => cat.slug === recommendedSlug)?.label)
    : [];
    
  // Fallback or "Latest"
  const latestContent = MOCK_CONTENT.filter(c => !recommendedContent.includes(c)).slice(0, 4);
  const featuredContent = MOCK_CONTENT[0];
  const trendingContent = MOCK_CONTENT.slice(3, 6);
  
  return (
    <div className="pb-12">
      {/* Hero / Header Section */}
      <section className="relative pt-24 pb-20 border-b border-gray-100 dark:border-white/5 overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-purple/5 dark:bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            {t('hero_title')} <span className="text-gradient">{t('hero_title_highlight')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(cat => (
              <Link 
                key={cat.id}
                to={`/${cat.slug}`}
                className="group relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              >
                <span className="absolute inset-0 rounded-full border border-gray-200 dark:border-white/10 group-hover:border-transparent transition-colors"></span>
                <span className="absolute inset-0 rounded-full bg-gradient-brand opacity-0 group-hover:opacity-10 transition-opacity"></span>
                <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-gradient-brand mask-linear transition-all"></span>
                {/* Fallback border implementation for hover gradient effect */}
                <div className="absolute inset-0 rounded-full p-[1px] bg-transparent group-hover:bg-gradient-brand -z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-full bg-white dark:bg-[#020617] rounded-full"></div>
                </div>

                <span className="relative text-gray-600 dark:text-slate-400 group-hover:text-brand-purple dark:group-hover:text-primary-300 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Daily Knowledge Mobile (Visible only on small screens) */}
        <div className="lg:hidden mb-12">
             <DailyKnowledge />
        </div>

        {/* Featured Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-brand rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">{t('featured')}</h2>
          </div>
          <KnowledgeCard item={featuredContent} featured={true} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* PERSONALIZED FEED (Feature 1) */}
            {recommendedContent.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                        <Sparkles size={16} />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">{t('recommended_for_you')}</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">{t('recommended_desc')}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">{t('latest')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {latestContent.map(item => (
                  <KnowledgeCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Ad Placeholder */}
            <div className="w-full h-40 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center group hover:border-brand-purple/30 transition-colors">
                <span className="text-gray-400 dark:text-slate-600 font-medium group-hover:text-brand-purple/70">{t('ad_space')}</span>
            </div>

            {/* Trending Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-1 h-6 bg-brand-orange rounded-full"></div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">{t('trending')}</h2>
                </div>
                <Link to="/categories" className="flex items-center text-brand-purple dark:text-primary-400 hover:text-brand-orange dark:hover:text-primary-300 font-medium text-sm transition-colors group">
                   {t('view_all')} <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {trendingContent.map(item => (
                  <KnowledgeCard key={item.id} item={item} />
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
             <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};