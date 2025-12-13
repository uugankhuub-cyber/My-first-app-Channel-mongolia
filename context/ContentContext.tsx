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
      // Fetch from our API route which queries Supabase
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Merge API content. In a real app, you might replace MOCK entirely.
          // For safety/demo, we use API data if available.
          setContent(json.data);
        } else {
          // Keep MOCK_CONTENT if DB is empty or connection fails
          console.log('Using fallback/mock content');
        }
      }
    } catch (e) {
      console.error("Failed to fetch content, using mocks", e);
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
