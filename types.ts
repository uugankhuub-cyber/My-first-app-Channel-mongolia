export interface Category {
  id: string;
  label: string;
  label_en: string;
  slug: string;
}

export interface Quiz {
  question: string;
  answer: string;
  options?: string[];
}

export type ContentStatus = 'published' | 'draft' | 'archived';

export interface ContentItem {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  thumbnailUrl: string;
  category: string; // Matches Category.label (MN)
  category_en: string; // Matches Category.label_en (EN)
  views: number;
  publishedDate: string;
  readTime: string; // "5 мин" or "5 min" handled in display logic or separated
  readTimeValue: number; // minutes
  isVideo: boolean;
  videoUrl?: string;
  contentBody?: string;
  contentBody_en?: string;
  tags: string[];
  tags_en: string[];
  isTrending?: boolean;
  isEditorPick?: boolean;
  likes?: number;
  quiz?: Quiz;
  status?: ContentStatus; // New field for Admin
}

export interface UserSettings {
  darkMode: boolean;
  language: 'mn' | 'en';
}

export interface Quote {
  text: string;
  text_en: string;
  author: string;
}

export interface UserPreferences {
  viewedCategories: Record<string, number>; // slug -> count
  likedTags: Record<string, number>; // tag -> count
  hasInteractedWithDaily: boolean;
}

// ADMIN & AI SPECIFIC TYPES
export interface AISuggestion {
  id: string;
  topic: string;
  reason: string;
  suggestedCategory: string;
  isUsed: boolean;
}

export interface FeedbackSummary {
  totalRatings: number;
  averageRating: number;
  topRequestedTopics: string[];
}