
import React from 'react';
import { CATEGORIES } from '../constants';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { Sidebar } from '../components/Sidebar';
import { DailyKnowledge } from '../components/DailyKnowledge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useContent } from '../context/ContentContext';
import { Container } from '../components/ui/Container';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const { getRecommendedCategory } = useUserPreferences();
  const { content: ALL_CONTENT } = useContent(); 
  
  const recommendedSlug = getRecommendedCategory();
  
  const recommendedContent = recommendedSlug 
    ? ALL_CONTENT.filter(c => c.category === CATEGORIES.find(cat => cat.slug === recommendedSlug)?.label)
    : [];
    
  const latestContent = ALL_CONTENT.filter(c => !recommendedContent.includes(c)).slice(0, 4);
  const featuredContent = ALL_CONTENT[0];
  const trendingContent = ALL_CONTENT.slice(3, 6);
  
  return (
    <div className="pb-16">
      {/* Hero / Header Section */}
      <section className="relative pt-24 pb-20 border-b border-border overflow-hidden bg-surfaceHighlight/30">
        {/* Subtle Ambient Background */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <Container className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight mb-6 leading-tight">
            {t('hero_title')} <span className="text-gradient">{t('hero_title_highlight')}</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero_subtitle')}
          </p>
          
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(cat => (
              <Link 
                key={cat.id}
                to={`/${cat.slug}`}
                className="px-5 py-2 rounded-full border border-border bg-surface text-sm font-medium text-text-muted hover:border-brand-purple hover:text-brand-purple transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="mt-12">
        
        <div className="lg:hidden mb-12">
             <DailyKnowledge />
        </div>

        {/* Featured Section */}
        {featuredContent && (
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-brand rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight">{t('featured')}</h2>
            </div>
            <KnowledgeCard item={featuredContent} featured={true} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* PERSONALIZED FEED */}
            {recommendedContent.length > 0 && (
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
                {latestContent.map(item => (
                  <KnowledgeCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Ad Placeholder */}
            <div className="w-full h-32 bg-surfaceHighlight rounded-2xl border border-dashed border-border flex items-center justify-center">
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
                {trendingContent.map(item => (
                  <KnowledgeCard key={item.id} item={item} />
                ))}
              </div>
            </section>

          </div>

          <div className="lg:col-span-1">
             <Sidebar />
          </div>
        </div>
      </Container>
    </div>
  );
};
