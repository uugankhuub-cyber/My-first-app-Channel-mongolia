export type NewsStatus = 'draft' | 'published';

export interface NewsSource {
  name: string;
  url: string;
}

export interface NewsImage {
  note?: string;
  ai_prompt?: string;
  url?: string;
}

export interface NewsSeo {
  meta_description?: string;
  keywords?: string[] | string;
}

export interface NewsShortIdea {
  hook?: string;
  outline?: string;
}

export interface NewsFactCheck {
  claim?: string;
  verification?: string;
  status?: string;
  [key: string]: any;
}

export interface NewsItem {
  id?: string;
  slug: string;
  status: NewsStatus;
  date: string;
  category: string;
  tags: string[];
  title: string;
  lead: string;
  body_markdown: string;
  sources: NewsSource[];
  image?: NewsImage;
  seo?: NewsSeo;
  short_idea?: NewsShortIdea;
  fact_check?: (NewsFactCheck | string)[];
  created_at: string;
  published_at?: string | null;
}
