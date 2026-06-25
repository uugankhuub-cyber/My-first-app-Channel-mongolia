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
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
}

export interface MockComment {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: string;
}

export interface MockTag {
  id: string;
  name: string;
}

export interface MockAuditLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface MockSetting {
  id: string;
  key: string;
  value: string;
}

interface MockDbState {
  users: MockUser[];
  articles: MockArticle[];
  categories: MockCategory[];
  comments: MockComment[];
  tags: MockTag[];
  auditLogs: MockAuditLog[];
  settings: MockSetting[];
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
  ],
  comments: [
    { id: 'com-1', articleId: 'art-1', articleTitle: 'Channel Mongolia тавтай морилно уу', authorName: 'Э.Бат', authorEmail: 'bat@example.com', content: 'Маш сонирхолтой мэдээлэл байна! Дараагийн нийтлэлийг хүлээж байна.', status: 'APPROVED', createdAt: new Date().toISOString() },
    { id: 'com-2', articleId: 'art-2', articleTitle: 'Монгол дахь хиймэл оюун ухааны ирээдүй', authorName: 'Н.Саруул', authorEmail: 'saruul@example.com', content: 'Манайд хөгжих бүрэн боломжтой сэдэв шүү.', status: 'PENDING', createdAt: new Date().toISOString() },
    { id: 'com-3', articleId: 'art-1', articleTitle: 'Channel Mongolia тавтай морилно уу', authorName: 'SpamBot', authorEmail: 'spam@spam.com', content: 'Earn money fast here http://fake-spam-link.xyz!', status: 'SPAM', createdAt: new Date().toISOString() }
  ],
  tags: [
    { id: 'tag-1', name: 'Сансар' },
    { id: 'tag-2', name: 'AI' },
    { id: 'tag-3', name: 'Технологи' },
    { id: 'tag-4', name: 'Физик' }
  ],
  auditLogs: [
    { id: 'log-1', userEmail: 'admin@channel.mn', action: 'LOGIN_SUCCESS', details: 'Удирдлагын хэсэгт амжилттай нэвтэрлээ.', ipAddress: '127.0.0.1', createdAt: new Date().toISOString() },
    { id: 'log-2', userEmail: 'editor@channel.mn', action: 'ARTICLE_CREATE', details: 'Шинэ нийтлэл "Монгол дахь хиймэл оюун ухааны ирээдүй" үүсгэлээ.', ipAddress: '127.0.0.1', createdAt: new Date().toISOString() }
  ],
  settings: [
    { id: 'set-1', key: 'siteName', value: 'Channel Mongolia' },
    { id: 'set-2', key: 'logoUrl', value: '' },
    { id: 'set-3', key: 'faviconUrl', value: '' },
    { id: 'set-4', key: 'contactEmail', value: 'info@channel.mn' },
    { id: 'set-5', key: 'contactPhone', value: '+976 7000-1234' },
    { id: 'set-6', key: 'fbLink', value: 'https://facebook.com/channelmongolia' },
    { id: 'set-7', key: 'seoTitle', value: 'Channel Mongolia - Шинжлэх ухаан, технологи, танин мэдэхүй' },
    { id: 'set-8', key: 'seoDesc', value: 'Дижитал мэдлэг, мэдээллийн нэгдсэн тавцан' }
  ]
};

// Initialize or load state
export function getDb(): MockDbState {
  try {
    if (fs.existsSync(MOCK_DB_FILE)) {
      const content = fs.readFileSync(MOCK_DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      
      // Ensure new collections are populated if missing in existing mock-db.json
      if (!data.comments) data.comments = defaultState.comments;
      if (!data.tags) data.tags = defaultState.tags;
      if (!data.auditLogs) data.auditLogs = defaultState.auditLogs;
      if (!data.settings) data.settings = defaultState.settings;
      
      return data;
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
  
  const fallbackEmail = 'uugankhuub@gmail.com';
  const fallbackPassword = 'Admin123!';
  
  let adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@channelmongolia.com';
  if (adminEmail.startsWith('INITIAL_ADMIN_EMAIL=')) {
    adminEmail = adminEmail.replace('INITIAL_ADMIN_EMAIL=', '');
  }
  let adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';
  if (adminPassword.startsWith('INITIAL_ADMIN_PASSWORD=')) {
    adminPassword = adminPassword.replace('INITIAL_ADMIN_PASSWORD=', '');
  }

  console.log(`[STARTUP-MOCK] Initial Mock Admin Credentials Configured - Email: "${adminEmail}", Password: "${adminPassword}"`);
  console.log(`[STARTUP-MOCK] Fallback Mock Admin Credentials Configured - Email: "${fallbackEmail}", Password: "${fallbackPassword}"`);

  // Clean any garbage "INITIAL_ADMIN_EMAIL=..." records
  state.users = state.users.filter(u => !u.email.startsWith('INITIAL_ADMIN_EMAIL='));

  const hashFallback = await hashPassword(fallbackPassword);
  const hashConfig = await hashPassword(adminPassword);

  // 1. Ensure fallback admin exists in Mock DB
  const fallbackExistsIdx = state.users.findIndex(u => u.email === fallbackEmail);
  if (fallbackExistsIdx === -1) {
    console.log('[STARTUP-MOCK] Seeding fallback admin to mock DB:', fallbackEmail);
    state.users.push({
      id: 'admin-fallback',
      email: fallbackEmail,
      passwordHash: hashFallback,
      role: 'ADMIN',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    console.log('[STARTUP-MOCK] Fallback admin exists in mock DB. Ensuring role is ADMIN and resetting password.');
    state.users[fallbackExistsIdx].role = 'ADMIN';
    state.users[fallbackExistsIdx].passwordHash = hashFallback;
  }

  // 2. Ensure env-configured admin exists in Mock DB if different
  if (adminEmail !== fallbackEmail) {
    const adminExistsIdx = state.users.findIndex(u => u.email === adminEmail);
    if (adminExistsIdx === -1) {
      console.log('[STARTUP-MOCK] Seeding configured admin to mock DB:', adminEmail);
      state.users.push({
        id: 'admin-configured',
        email: adminEmail,
        passwordHash: hashConfig,
        role: 'ADMIN',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      console.log('[STARTUP-MOCK] Configured admin exists in mock DB. Ensuring role is ADMIN.');
      state.users[adminExistsIdx].role = 'ADMIN';
    }
  }

  saveDb(state);
}
