import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FactBoxProps {
  fact: string;
}

export const FactBox: React.FC<FactBoxProps> = ({ fact }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white dark:bg-[#151E32] border border-gray-100 dark:border-white/5 rounded-xl p-6 relative overflow-hidden shadow-sm dark:shadow-lg group hover:border-primary-200 dark:hover:border-primary-500/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/10 dark:to-transparent opacity-50"></div>
      
      <div className="absolute top-0 right-0 -mt-4 -mr-4 text-primary-100 dark:text-primary-500/10 opacity-50 group-hover:text-primary-200 dark:group-hover:text-primary-500/20 transition-colors duration-500">
        <Lightbulb size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 text-primary-600 dark:text-primary-400">
          <Lightbulb size={20} fill="currentColor" className="drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('did_you_know')}</span>
        </div>
        <p className="text-gray-800 dark:text-slate-200 font-medium text-lg leading-relaxed font-serif italic border-l-2 border-primary-500/50 pl-4">
          "{fact}"
        </p>
      </div>
    </div>
  );
};