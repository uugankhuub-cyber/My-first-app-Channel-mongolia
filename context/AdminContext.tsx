import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AISuggestion, ContentItem, FeedbackSummary } from '../types';
import { MOCK_CONTENT } from '../constants';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  aiSuggestions: AISuggestion[];
  generateDraftFromAI: (suggestionId: string) => Promise<ContentItem>;
  adminContent: ContentItem[];
  saveContent: (content: ContentItem) => void;
  deleteContent: (id: string) => void;
  feedbackSummary: FeedbackSummary;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Mock AI Suggestions
const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'ai-1',
    topic: 'Монголын эртний нүүдэлчдийн одон орон судлал',
    reason: 'Түүх болон Шинжлэх ухааны ангилалд хэрэглэгчдийн сонирхол их байна.',
    suggestedCategory: 'Түүх, газарзүй',
    isUsed: false,
  },
  {
    id: 'ai-2',
    topic: 'Квант компьютерийн ирээдүй ба Монгол улс',
    reason: 'Технологийн сүүлийн үеийн мэдээлэл хайсан илэрц нэмэгдсэн.',
    suggestedCategory: 'Шинжлэх ухаан',
    isUsed: false,
  },
  {
    id: 'ai-3',
    topic: 'Стресс менежмент ба тархины эрүүл мэнд',
    reason: '"Хүмүүс" ангилалд сэтгэл зүйн зөвлөгөө эрэлттэй байна.',
    suggestedCategory: 'Хүмүүс',
    isUsed: false,
  }
];

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>(MOCK_SUGGESTIONS);
  // Initialize with MOCK_CONTENT marked as published, plus a dummy draft
  const [adminContent, setAdminContent] = useState<ContentItem[]>([
    ...MOCK_CONTENT.map(c => ({ ...c, status: 'published' as const })),
    {
      id: 'draft-1',
      title: 'Ноорог: Ирээдүйн технологи',
      title_en: 'Draft: Future Tech',
      description: 'Энэ бол засварлаж буй ноорог юм.',
      description_en: 'Draft content.',
      thumbnailUrl: 'https://picsum.photos/800/450?grayscale',
      category: 'Шинжлэх ухаан',
      category_en: 'Science',
      views: 0,
      publishedDate: new Date().toISOString().split('T')[0],
      readTime: '3 мин',
      readTimeValue: 3,
      isVideo: false,
      tags: [],
      tags_en: [],
      status: 'draft',
      contentBody: 'Энд нийтлэлийн эх бичвэрийг бичнэ үү...'
    }
  ]);

  const feedbackSummary: FeedbackSummary = {
    totalRatings: 1240,
    averageRating: 4.6,
    topRequestedTopics: ['Сансар огторгуй', 'Хиймэл оюун ухаан', 'Монголын түүх']
  };

  const login = (password: string) => {
    // Simple mock auth - In production, use real backend auth
    if (password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const generateDraftFromAI = async (suggestionId: string): Promise<ContentItem> => {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) throw new Error("Suggestion not found");

    // Mark as used
    setAiSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, isUsed: true } : s));

    // Create Draft Object
    const newDraft: ContentItem = {
      id: `draft-${Date.now()}`,
      title: suggestion.topic,
      title_en: 'AI Generated Draft',
      description: `Энэхүү нооргийг AI систем "${suggestion.reason}" дээр үндэслэн үүсгэв.`,
      description_en: 'AI Generated Draft',
      thumbnailUrl: 'https://picsum.photos/800/450?blur=2',
      category: suggestion.suggestedCategory,
      category_en: 'General',
      views: 0,
      publishedDate: new Date().toISOString().split('T')[0],
      readTime: '5 мин',
      readTimeValue: 5,
      isVideo: false,
      tags: ['AI Draft'],
      tags_en: ['AI Draft'],
      status: 'draft',
      contentBody: `### ${suggestion.topic}\n\n(Энд AI систем нийтлэлийн дэлгэрэнгүйг үүсгэх болно. Редактор та хянан засварлана уу.)\n\n1. Оршил\n2. Үндсэн хэсэг\n3. Дүгнэлт`
    };

    setAdminContent(prev => [newDraft, ...prev]);
    return newDraft;
  };

  const saveContent = (content: ContentItem) => {
    setAdminContent(prev => {
      const exists = prev.find(c => c.id === content.id);
      if (exists) {
        return prev.map(c => c.id === content.id ? content : c);
      }
      return [content, ...prev];
    });
  };

  const deleteContent = (id: string) => {
    setAdminContent(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      aiSuggestions,
      generateDraftFromAI,
      adminContent,
      saveContent,
      deleteContent,
      feedbackSummary
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};