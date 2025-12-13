import React from 'react';
import { CATEGORIES, MOCK_CONTENT } from '../constants';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface CategoriesPageProps {
    categorySlug?: string;
    filter?: string; // For 'video' or 'all'
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categorySlug, filter }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isEn = language === 'en';
  
  // Determine active slug from props
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
      if (activeSlug === 'all') return MOCK_CONTENT;
      if (activeSlug === 'video') return MOCK_CONTENT.filter(c => c.isVideo);
      
      const catObj = CATEGORIES.find(cat => cat.slug === activeSlug);
      return catObj 
         ? MOCK_CONTENT.filter(c => c.category === catObj.label || c.category_en === catObj.label_en)
         : MOCK_CONTENT;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 mb-4 md:mb-0 drop-shadow-md">
          {activeCategoryLabel}
        </h1>
        
        {/* Simple Sort Dropdown (Visual only) */}
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">{t('sort_by')}</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 text-slate-300 transition-colors">
                <Filter size={16} />
                <span>{t('newest')}</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
            <div className="bg-brand-surface p-4 rounded-xl shadow-lg border border-white/5 sticky top-24">
                <h3 className="font-bold text-slate-200 mb-4 px-2">{t('nav_categories')}</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeSlug === 'all' 
                            ? 'bg-primary-900/30 text-primary-400 border border-primary-500/20 shadow-glow' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                    >
                        {t('all_knowledge')}
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange(cat.slug)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeSlug === cat.slug 
                                ? 'bg-primary-900/30 text-primary-400 border border-primary-500/20 shadow-glow' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="lg:col-span-3">
            {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredContent.map(item => (
                        <KnowledgeCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-brand-surface rounded-xl border border-dashed border-white/10">
                    <p className="text-slate-500">{t('no_results')}</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
