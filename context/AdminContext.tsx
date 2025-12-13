import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AISuggestion, ContentItem, FeedbackSummary } from '../types';
import { MOCK_CONTENT } from '../constants';

// --- Types ---
export interface ChatSettings {
  systemPrompt: string;
  suggestedQuestions: string[];
  isEnabled: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface SiteAppearance {
  fontFamily: string;
  baseFontSize: number;
  letterSpacing: number;
}

export interface SiteImages {
  [key: string]: string; // key (e.g., 'hero_bg') -> url
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  
  // AI & Content
  aiSuggestions: AISuggestion[];
  generateDraftFromAI: (suggestionId: string) => Promise<ContentItem>;
  adminContent: ContentItem[];
  saveContent: (content: ContentItem) => void;
  deleteContent: (id: string) => void;
  feedbackSummary: FeedbackSummary;

  // Chat Settings
  chatSettings: ChatSettings;
  updateChatSettings: (settings: ChatSettings) => void;

  // Image Gallery
  uploadedImages: UploadedImage[];
  addImage: (image: UploadedImage) => void;
  deleteImage: (id: string) => void;

  // Site Settings (New)
  siteAppearance: SiteAppearance;
  updateSiteAppearance: (appearance: SiteAppearance) => void;
  siteImages: SiteImages;
  updateSiteImage: (key: string, url: string) => void;
  resetSiteAppearance: () => void;
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

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  systemPrompt: "You are a helpful, knowledgeable assistant for Channel Mongolia. You explain complex topics simply. You answer in the same language the user asks.",
  suggestedQuestions: ["Шинжлэх ухааны сонин хачин?", "Өнөөдрийн тренд?", "Хамгийн их уншсан нийтлэл?"],
  isEnabled: true
};

const DEFAULT_APPEARANCE: SiteAppearance = {
  fontFamily: 'Inter',
  baseFontSize: 16,
  letterSpacing: 0
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State with Persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cm_admin_auth') === 'true';
  });

  // Persist Auth State
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('cm_admin_auth', 'true');
    } else {
      localStorage.removeItem('cm_admin_auth');
    }
  }, [isAuthenticated]);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>(MOCK_SUGGESTIONS);
  
  // Content State
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

  // Chat Settings State (Persisted)
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    const saved = localStorage.getItem('cm_admin_chat');
    return saved ? JSON.parse(saved) : DEFAULT_CHAT_SETTINGS;
  });

  // Uploaded Images State (Persisted)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(() => {
    const saved = localStorage.getItem('cm_admin_images');
    return saved ? JSON.parse(saved) : [];
  });

  // Site Appearance (Persisted)
  const [siteAppearance, setSiteAppearance] = useState<SiteAppearance>(() => {
    const saved = localStorage.getItem('cm_site_appearance');
    return saved ? JSON.parse(saved) : DEFAULT_APPEARANCE;
  });

  // Site Images Map (Persisted)
  const [siteImages, setSiteImages] = useState<SiteImages>(() => {
    const saved = localStorage.getItem('cm_site_images_map');
    return saved ? JSON.parse(saved) : {};
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cm_admin_chat', JSON.stringify(chatSettings));
  }, [chatSettings]);

  useEffect(() => {
    localStorage.setItem('cm_admin_images', JSON.stringify(uploadedImages));
  }, [uploadedImages]);

  useEffect(() => {
    localStorage.setItem('cm_site_appearance', JSON.stringify(siteAppearance));
  }, [siteAppearance]);

  useEffect(() => {
    localStorage.setItem('cm_site_images_map', JSON.stringify(siteImages));
  }, [siteImages]);


  const feedbackSummary: FeedbackSummary = {
    totalRatings: 1240,
    averageRating: 4.6,
    topRequestedTopics: ['Сансар огторгуй', 'Хиймэл оюун ухаан', 'Монголын түүх']
  };

  const login = (password: string) => {
    // Check environment variable (Vite uses import.meta.env, Node uses process.env)
    const secret = (import.meta as any).env?.VITE_ADMIN_SECRET || process.env.ADMIN_SECRET;
    
    if (!secret) {
      console.error("ADMIN_SECRET is not set in environment variables.");
      return false; 
    }

    if (password === secret) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cm_admin_auth');
  };

  const generateDraftFromAI = async (suggestionId: string): Promise<ContentItem> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) throw new Error("Suggestion not found");

    setAiSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, isUsed: true } : s));

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
      contentBody: `### ${suggestion.topic}\n\n(AI generated content...)\n\n1. Оршил\n2. Үндсэн хэсэг\n3. Дүгнэлт`
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

  const updateChatSettings = (settings: ChatSettings) => {
    setChatSettings(settings);
  };

  const addImage = (image: UploadedImage) => {
    setUploadedImages(prev => [image, ...prev]);
  };

  const deleteImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const updateSiteAppearance = (appearance: SiteAppearance) => {
    setSiteAppearance(appearance);
  };

  const resetSiteAppearance = () => {
    setSiteAppearance(DEFAULT_APPEARANCE);
  };

  const updateSiteImage = (key: string, url: string) => {
    setSiteImages(prev => ({ ...prev, [key]: url }));
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
      feedbackSummary,
      chatSettings,
      updateChatSettings,
      uploadedImages,
      addImage,
      deleteImage,
      siteAppearance,
      updateSiteAppearance,
      resetSiteAppearance,
      siteImages,
      updateSiteImage
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