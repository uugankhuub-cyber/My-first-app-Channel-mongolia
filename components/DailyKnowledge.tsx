
import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { INTERESTING_FACTS } from '../constants';

export const DailyKnowledge: React.FC = () => {
  const { t, language } = useLanguage();
  const { dailyFactInteracted, setDailyFactInteracted } = useUserPreferences();
  const [feedbackGiven, setFeedbackGiven] = useState(dailyFactInteracted);
  
  // Deterministic daily fact based on date to simulate "Daily" nature
  const today = new Date();
  const dayIndex = (today.getDate() + today.getMonth()) % INTERESTING_FACTS[language].length;
  const fact = INTERESTING_FACTS[language][dayIndex];

  const handleFeedback = (isPositive: boolean) => {
      if(feedbackGiven) return;
      setFeedbackGiven(true);
      setDailyFactInteracted(true);
      // In a real app, send analytics here
  };

  return (
    <div className="bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm dark:shadow-lg group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
          <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
             <Lightbulb size={18} className="drop-shadow-sm" />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">{t('daily_knowledge')}</span>
        </div>
        
        <p className="text-slate-800 dark:text-slate-100 font-medium text-lg leading-relaxed font-serif mb-6">
          "{fact}"
        </p>

        {/* Feedback Section */}
        <div className={`transition-all duration-500 ease-out overflow-hidden ${feedbackGiven ? 'h-auto opacity-100' : 'h-auto opacity-100'}`}>
            {!feedbackGiven ? (
                <div className="flex flex-col gap-3">
                    <span className="text-xs text-text-muted font-medium">{t('daily_feedback_q')}</span>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleFeedback(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/50 dark:bg-white/5 border border-border text-xs font-bold text-text-muted hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800/50 transition-all"
                        >
                            <ThumbsUp size={14} />
                            {t('daily_yes')}
                        </button>
                        <button 
                            onClick={() => handleFeedback(false)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/50 dark:bg-white/5 border border-border text-xs font-bold text-text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/50 transition-all"
                        >
                            <ThumbsDown size={14} />
                            {t('daily_no')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 animate-fade-in">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-medium">{t('daily_thanks')}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
