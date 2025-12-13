import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { Quiz } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="my-10 bg-brand-surface border border-white/5 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-brand p-1"></div>
      <div className="p-6 md:p-8">
         <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center flex-shrink-0 text-brand-purple">
                <HelpCircle size={24} />
            </div>
            <div>
                <h3 className="text-brand-purple text-xs font-bold uppercase tracking-wider mb-1">{t('quiz_title')}</h3>
                <p className="text-xl font-bold text-white leading-snug">{quiz.question}</p>
            </div>
         </div>

         <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-4 mt-4 border-t border-white/10 flex gap-3">
                 <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                 <p className="text-slate-300 leading-relaxed">{quiz.answer}</p>
            </div>
         </div>

         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full mt-6 py-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
         >
            <span>{isOpen ? t('quiz_hide') : t('quiz_reveal')}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
         </button>
      </div>
    </div>
  );
};