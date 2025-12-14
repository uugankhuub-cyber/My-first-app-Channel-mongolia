
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { KnowledgeCard } from '../components/KnowledgeCard';
import * as ReactRouterDOM from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const { useSearchParams } = ReactRouterDOM;

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const { t, language } = useLanguage();
  const { content } = useContent(); // Dynamic
  const isEn = language === 'en';

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filtered = searchTerm 
    ? content.filter(c => {
        const title = isEn ? c.title_en : c.title;
        const desc = isEn ? c.description_en : c.description;
        return (title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
               (desc || '').toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  const handleClear = () => setSearchTerm('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
        <div className="max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl font-bold text-center text-text-main mb-8 drop-shadow-sm dark:drop-shadow-md">{t('search_placeholder')}</h1>
            
            {/* HERO SEARCH BAR - INTEGRATED UI */}
            <div className="relative group">
                <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full h-14 pl-12 pr-12 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus:bg-white dark:focus:bg-slate-900 focus:border-brand-purple/30 focus:ring-4 focus:ring-brand-purple/10 outline-none text-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm hover:shadow-md transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                {searchTerm && (
                    <button 
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        aria-label="Clear search"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>

        {searchTerm && (
            <div>
                <h2 className="text-lg font-bold text-text-main mb-8 pb-4 border-b border-border">
                    {t('search_results')} <span className="text-primary-600 dark:text-primary-400 ml-2">{filtered.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filtered.map(item => (
                        <KnowledgeCard key={item.id} item={item} />
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                         <p className="text-text-muted text-lg">{t('no_results')}</p>
                    </div>
                )}
            </div>
        )}

        {!searchTerm && (
            <div className="text-center">
                 <p className="text-text-muted text-sm">Channel Mongolia</p>
            </div>
        )}
    </div>
  );
};
