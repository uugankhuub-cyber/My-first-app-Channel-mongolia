import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AISuggestion, ContentItem, FeedbackSummary } from '../types';
import { useContent } from './ContentContext';

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
  lineHeight: number;
}

export interface SiteImages {
  [key: string]: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  
  // AI & Content
  aiSuggestions: AISuggestion[];
  generateDraftFromAI: (suggestionId: string) => Promise<ContentItem>;
  adminContent: ContentItem[];
  saveContent: (content: ContentItem) => Promise<boolean>;
  deleteContent: (id: string) => void;
  uploadImage: (file: File) => Promise<string | null>;
  
  // New AI Helper
  askAI: (action: string, text: string) => Promise<string>;

  feedbackSummary: FeedbackSummary;
  chatSettings: ChatSettings;
  updateChatSettings: (settings: ChatSettings) => void;
  uploadedImages: UploadedImage[];
  addImage: (image: UploadedImage) => void;
  deleteImage: (id: string) => void;
  siteAppearance: SiteAppearance;
  updateSiteAppearance: (appearance: SiteAppearance) => void;
  resetSiteAppearance: () => void;
  siteImages: SiteImages;
  updateSiteImage: (key: string, url: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Defaults & Mocks
const DEFAULT_APPEARANCE: SiteAppearance = { fontFamily: 'Inter', baseFontSize: 16, letterSpacing: 0, lineHeight: 1.6 };
const DEFAULT_CHAT_SETTINGS: ChatSettings = { systemPrompt: "You are a helpful assistant.", suggestedQuestions: ["Trend?", "News?"], isEnabled: true };

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { content: globalContent, refreshContent } = useContent();

  // Auth State
  const [token, setToken] = useState<string | null>(() => {
      // Check local storage for persistence
      if (typeof window !== 'undefined') {
          return localStorage.getItem('cm_admin_token');
      }
      return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Local Admin State
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]); 
  const [chatSettings, setChatSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [siteAppearance, setSiteAppearance] = useState<SiteAppearance>(DEFAULT_APPEARANCE);
  const [siteImages, setSiteImages] = useState<SiteImages>({});

  const login = async (password: string): Promise<boolean> => {
    try {
      // Use the INITIAL_ADMIN_EMAIL for logging in as admin
      const email = 'admin@channel.mn'; // Or get from config
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setIsAuthenticated(true);
        // Token is now in HttpOnly cookie, but we can store user info
        localStorage.setItem('cm_admin_auth', 'true');
        return true;
      }
      return false;
    } catch (e) { return false; }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch (e) { return false; }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('cm_admin_auth');
    localStorage.removeItem('cm_admin_token');
  };

  const saveContent = async (contentItem: ContentItem): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contentItem)
      });
      if (res.ok) {
        await refreshContent(); // Refresh global context
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const askAI = async (action: string, text: string): Promise<string> => {
    if (!token) return "Unauthorized";
    try {
      const res = await fetch('/api/admin-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, text })
      });
      const data = await res.json();
      return data.result || "No response";
    } catch (e) {
      return "AI Error";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
      if (!token) return null;
      try {
          // Convert file to base64
          const reader = new FileReader();
          return new Promise((resolve) => {
              reader.onload = async () => {
                  const base64 = (reader.result as string).split(',')[1];
                  const res = await fetch('/api/admin-upload', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ 
                          fileName: file.name,
                          fileType: file.type,
                          fileBase64: base64
                      })
                  });
                  if (res.ok) {
                      const data = await res.json();
                      // Add to local gallery too
                      addImage({
                          id: Date.now().toString(),
                          url: data.url,
                          name: file.name,
                          size: file.size,
                          uploadedAt: new Date().toISOString()
                      });
                      resolve(data.url);
                  } else {
                      resolve(null);
                  }
              };
              reader.readAsDataURL(file);
          });
      } catch (e) {
          console.error(e);
          return null;
      }
  };

  // Mocks/Placeholders
  const generateDraftFromAI = async (id: string) => { 
      return { id: 'new', title: 'New', title_en: 'New', description: '', description_en: '', category: 'Tech', category_en: 'Tech', views: 0, publishedDate: '', readTime: '5', readTimeValue: 5, isVideo: false, tags: [], tags_en: [], thumbnailUrl: '' } as ContentItem; 
  };
  const deleteContent = (id: string) => { /* Implement delete via API later */ };
  const updateChatSettings = (s: ChatSettings) => setChatSettings(s);
  const addImage = (img: UploadedImage) => setUploadedImages(p => [img, ...p]);
  const deleteImage = (id: string) => setUploadedImages(p => p.filter(i => i.id !== id));
  const updateSiteAppearance = (a: SiteAppearance) => setSiteAppearance(a);
  const resetSiteAppearance = () => setSiteAppearance(DEFAULT_APPEARANCE);
  const updateSiteImage = (k: string, v: string) => setSiteImages(p => ({...p, [k]: v}));

  // Load persisted local settings
  useEffect(() => {
    const savedImg = localStorage.getItem('cm_admin_images');
    if (savedImg) setUploadedImages(JSON.parse(savedImg));
    const savedApp = localStorage.getItem('cm_site_appearance');
    if (savedApp) setSiteAppearance(JSON.parse(savedApp));
  }, []);

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, register, logout, token,
      adminContent: globalContent,
      saveContent, deleteContent, uploadImage,
      aiSuggestions, generateDraftFromAI,
      askAI,
      feedbackSummary: { totalRatings: 0, averageRating: 0, topRequestedTopics: [] },
      chatSettings, updateChatSettings,
      uploadedImages, addImage, deleteImage,
      siteAppearance, updateSiteAppearance, resetSiteAppearance,
      siteImages, updateSiteImage: updateSiteImage
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
