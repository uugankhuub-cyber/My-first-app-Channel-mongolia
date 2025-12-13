import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ContentItem } from '../types';
import { MOCK_CONTENT } from '../constants';

interface ContentContextType {
  content: ContentItem[];
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentItem[]>(MOCK_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Merge API content with MOCK content (API takes precedence)
          // validIds tracks IDs from API to avoid duplicates if we want to keep some mocks
          // For now, let's replace mocks if API returns data, or append/merge.
          // Strategy: Use API data. If API has data, use it. 
          // If we want to strictly keep MOCKs for demo when API empty:
          
          setContent(json.data);
        } else {
          // Fallback to mocks if DB empty
          setContent(MOCK_CONTENT);
        }
      }
    } catch (e) {
      console.error("Failed to fetch content, using mocks", e);
      setContent(MOCK_CONTENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, refreshContent: fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
