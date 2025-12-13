import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { MOCK_CONTENT } from '../constants';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filtered = searchTerm 
    ? MOCK_CONTENT.filter(c => {
        const title = isEn ? c.title_en : c.title;
        const desc = isEn ? c.description_en : c.description;
        return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               desc.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
        <div className="max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-slate-100 mb-8 drop-shadow-sm dark:drop-shadow-md">{t('search_placeholder')}</h1>
            <div className="relative group">
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none text-lg text-gray-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-lg transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors" size={24} />
            </div>
        </div>

        {searchTerm && (
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-200 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                    {t('search_results')} <span className="text-primary-600 dark:text-primary-400 ml-2">{filtered.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filtered.map(item => (
                        <KnowledgeCard key={item.id} item={item} />
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-brand-surface rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                         <p className="text-slate-500 text-lg">{t('no_results')}</p>
                    </div>
                )}
            </div>
        )}

        {!searchTerm && (
            <div className="text-center">
                 <p className="text-slate-500 dark:text-slate-600 text-sm">Channel Mongolia</p>
            </div>
        )}
    </div>
  );
};