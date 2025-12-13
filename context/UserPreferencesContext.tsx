import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CATEGORIES } from '../constants';

interface UserPreferencesContextType {
  trackView: (categorySlug: string) => void;
  getRecommendedCategory: () => string | null;
  dailyFactInteracted: boolean;
  setDailyFactInteracted: (val: boolean) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('cm_view_counts');
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyFactInteracted, setDailyFactInteractedState] = useState<boolean>(() => {
     // Simple check if interacted today (resetting logic simulated here by just storing generic bool for demo)
     return localStorage.getItem('cm_daily_fact_done') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cm_view_counts', JSON.stringify(viewCounts));
  }, [viewCounts]);

  const setDailyFactInteracted = (val: boolean) => {
      setDailyFactInteractedState(val);
      localStorage.setItem('cm_daily_fact_done', String(val));
  }

  const trackView = (categorySlug: string) => {
     // Normalize category if needed, here we use slugs directly
     const slug = CATEGORIES.find(c => c.label === categorySlug || c.label_en === categorySlug || c.slug === categorySlug)?.slug;
     if(slug) {
         setViewCounts(prev => ({
             ...prev,
             [slug]: (prev[slug] || 0) + 1
         }));
     }
  };

  const getRecommendedCategory = () => {
      let max = 0;
      let recommended = null;
      for (const [slug, count] of Object.entries(viewCounts)) {
          const countNum = count as number;
          if (countNum > max) {
              max = countNum;
              recommended = slug;
          }
      }
      return recommended;
  };

  return (
    <UserPreferencesContext.Provider value={{ trackView, getRecommendedCategory, dailyFactInteracted, setDailyFactInteracted }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};