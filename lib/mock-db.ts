import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth.ts';

const MOCK_DB_FILE = path.join(process.cwd(), 'mock-db.json');

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  emailVerified: boolean;
  verificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockArticle {
  id: string;
  title: string;
  title_en: string;
  slug: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId?: string;
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
}

interface MockDbState {
  users: MockUser[];
  articles: MockArticle[];
  categories: MockCategory[];
}

const defaultState: MockDbState = {
  users: [],
  categories: [
    { id: 'cat-1', name: 'Шинжлэх Ухаан', slug: 'science' },
    { id: 'cat-2', name: 'Технологи', slug: 'technology' },
    { id: 'cat-3', name: 'Соёл Урлаг', slug: 'culture' }
  ],
  articles: [
    {
      id: 'art-1',
      title: 'Channel Mongolia тавтай морилно уу',
      title_en: 'Welcome to Channel Mongolia',
      slug: 'welcome',
      excerpt: 'Орчин үеийн дижитал мэдлэг, мэдээллийн нэгдсэн тавцан болох манай хуудсаар аялаарай.',
      excerpt_en: 'Explore our modern digital knowledge and media platform sharing interesting science, tech, and facts.',
      content: 'Манай платформ нь танд шинжлэх ухаан, технологи, соёл урлагийн хамгийн сүүлийн үеийн сонирхолтой мэдээ мэдээллийг хүргэж байна.',
      content_en: 'Our platform delivers the latest and most interesting news and facts about science, technology, and culture.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      status: 'PUBLISHED',
      categoryId: 'cat-1',
      views: 1250,
      likes: 45,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'art-2',
      title: 'Монгол дахь хиймэл оюун ухааны ирээдүй',
      title_en: 'The Future of AI in Mongolia',
      slug: 'future-of-ai',
      excerpt: 'Хиймэл оюун ухаан нь бүс нутгийн технологийн хөгжилд хэрхэн нөлөөлж байгааг судлах нь.',
      excerpt_en: 'Exploring how artificial intelligence is shaping the technological landscape of the region.',
      content: 'Хиймэл оюун ухаан нь дэлхий даяар хурдацтай хөгжиж байгаа бөгөөд Монгол улс ч үүнээс хоцрохгүй хөл нийлүүлэн алхаж байна.',
      content_en: 'Artificial intelligence is developing rapidly worldwide, and Mongolia is keeping pace with this technological shift.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      status: 'PUBLISHED',
      categoryId: 'cat-2',
      views: 890,
      likes: 24,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Initialize or load state
export function getDb(): MockDbState {
  try {
    if (fs.existsSync(MOCK_DB_FILE)) {
      const content = fs.readFileSync(MOCK_DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading mock db, falling back to defaults:', e);
  }
  
  // Save default state if file doesn't exist
  saveDb(defaultState);
  return defaultState;
}

export function saveDb(state: MockDbState) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving mock db:', e);
  }
}

// Helper to seed initial admin dynamically
export async function ensureAdmin() {
  const state = getDb();
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@channelmongolia.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';

  const adminExists = state.users.find(u => u.email === adminEmail);
  if (!adminExists) {
    console.log('Seeding initial admin to mock DB:', adminEmail);
    const hash = await hashPassword(adminPassword);
    state.users.push({
      id: 'admin-1',
      email: adminEmail,
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    saveDb(state);
  }
}
