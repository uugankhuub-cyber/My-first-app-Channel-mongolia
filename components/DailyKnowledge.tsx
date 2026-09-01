
import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { INTERESTING_FACTS } from '../constants';
import { cn } from '../lib/utils';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-brand-purple to-brand-orange text-white rounded-[14px] p-6 relative overflow-hidden shadow-[var(--shadow-card)] group"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-white/90">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg"
          >
             <Lightbulb size={18} className="drop-shadow-sm" />
          </motion.div>
          <span className="font-bold text-[0.72rem] uppercase tracking-widest">{t('daily_knowledge')}</span>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white font-medium text-lg leading-relaxed font-serif mb-6"
        >
          "{fact}"
        </motion.p>

        {/* Feedback Section */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!feedbackGiven ? (
                <motion.div 
                  key="feedback-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-3"
                >
                    <span className="text-[0.72rem] text-white/80 font-medium">{t('daily_feedback_q')}</span>
                    <div className="flex gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleFeedback(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] bg-black/20 border border-white/20 text-xs font-bold text-white hover:bg-white/20 hover:border-white/40 transition-all"
                        >
                            <ThumbsUp size={14} />
                            {t('daily_yes')}
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleFeedback(false)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] bg-black/20 border border-white/20 text-xs font-bold text-white hover:bg-white/20 hover:border-white/40 transition-all"
                        >
                            <ThumbsDown size={14} />
                            {t('daily_no')}
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                  key="thanks-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-white bg-black/20 backdrop-blur-sm p-3 rounded-[8px] border border-white/20"
                >
                    <CheckCircle2 size={16} />
                    <span className="text-[0.72rem] font-medium">{t('daily_thanks')}</span>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
