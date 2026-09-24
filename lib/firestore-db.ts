import { db } from './firebase.ts';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  emailVerified: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId?: string;
  views?: number;
  likes?: number;
  tags?: string[];
  images?: Array<{ url: string; caption?: string } | string>;
  metaTitle?: string;
  metaDesc?: string;
  agentNotes?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// 9 Standard Categories matching Main Navigation Menu
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-mongol', name: 'Монгол', slug: 'mongol' },
  { id: 'cat-delhii', name: 'Дэлхий', slug: 'delhii' },
  { id: 'cat-humuus', name: 'Хүмүүс', slug: 'humuus' },
  { id: 'cat-shinzhleh-uhaan', name: 'Шинжлэх ухаан', slug: 'shinzhleh-uhaan' },
  { id: 'cat-tuuh-gazarzui', name: 'Түүх, газарзүй', slug: 'tuuh-gazarzui' },
  { id: 'cat-urlag', name: 'Урлаг', slug: 'urlag' },
  { id: 'cat-sport', name: 'Спорт', slug: 'sport' },
  { id: 'cat-amitun-urgamal', name: 'Амьтан, ургамал', slug: 'amitun-urgamal' },
  { id: 'cat-video', name: 'Видео', slug: 'video' },
];

// --- CATEGORIES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const list: Category[] = [];
    snap.forEach(d => {
      const data = d.data() as Category;
      list.push({ ...data, id: d.id });
    });
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getCategories error:', err.message);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const snap = await getDoc(doc(db, 'categories', id));
    if (snap.exists()) {
      return { ...(snap.data() as Category), id: snap.id };
    }
    return null;
  } catch (err: any) {
    console.error('[FIRESTORE] getCategoryById error:', err.message);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  const norm = slug.trim().toLowerCase();
  return categories.find(c => c.slug.toLowerCase() === norm) || null;
}

export async function createCategory(cat: { name: string; slug: string; id?: string }): Promise<Category> {
  const id = cat.id || 'cat-' + cat.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const newCat: Category = { id, name: cat.name, slug: cat.slug };
  await setDoc(doc(db, 'categories', id), newCat);
  return newCat;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string }): Promise<Category | null> {
  const ref = doc(db, 'categories', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const updated = { ...snap.data(), ...data, id } as Category;
  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'categories', id));
  return true;
}

export async function ensureDefaultCategories(): Promise<void> {
  try {
    const existing = await getCategories();
    for (const defCat of DEFAULT_CATEGORIES) {
      const exists = existing.some(
        c => c.id === defCat.id || c.slug.toLowerCase() === defCat.slug.toLowerCase()
      );
      if (!exists) {
        console.log(`[FIRESTORE] Seeding missing category: ${defCat.name} (${defCat.slug})`);
        await setDoc(doc(db, 'categories', defCat.id), defCat);
      }
    }
  } catch (err: any) {
    console.error('[FIRESTORE] Error ensuring default categories:', err.message);
  }
}

// --- ARTICLES ---
export async function getArticles(filter?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Article[]> {
  try {
    const snap = await getDocs(collection(db, 'articles'));
    let list: Article[] = [];
    snap.forEach(d => {
      const data = d.data() as Article;
      list.push({ ...data, id: d.id });
    });

    // Sort by createdAt descending
    list.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (filter?.status) {
      const s = filter.status.toUpperCase();
      list = list.filter(a => a.status?.toUpperCase() === s);
    }

    if (filter?.category) {
      const catQuery = filter.category.trim().toLowerCase();
      const categories = await getCategories();
      const matchedCat = categories.find(
        c => c.name.toLowerCase() === catQuery || c.slug.toLowerCase() === catQuery || c.id === catQuery
      );
      if (matchedCat) {
        list = list.filter(a => a.categoryId === matchedCat.id || a.categoryId === matchedCat.slug);
      } else {
        list = [];
      }
    }

    if (filter?.search) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter(
        a =>
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q)
      );
    }

    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getArticles error:', err.message);
    return [];
  }
}

export async function getArticleByIdOrSlug(idOrSlug: string): Promise<Article | null> {
  try {
    // 1. Try direct ID lookup
    const directDoc = await getDoc(doc(db, 'articles', idOrSlug));
    if (directDoc.exists()) {
      return { ...(directDoc.data() as Article), id: directDoc.id };
    }

    // 2. Query by slug
    const snap = await getDocs(collection(db, 'articles'));
    let found: Article | null = null;
    snap.forEach(d => {
      const data = d.data() as Article;
      if (data.slug === idOrSlug || d.id === idOrSlug) {
        found = { ...data, id: d.id };
      }
    });

    return found;
  } catch (err: any) {
    console.error('[FIRESTORE] getArticleByIdOrSlug error:', err.message);
    return null;
  }
}

export async function createArticle(
  articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
  customId?: string
): Promise<Article> {
  const id = customId || articleData.id || 'art-' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const article: Article = {
    ...articleData,
    id,
    views: articleData.views || 0,
    likes: articleData.likes || 0,
    createdAt: articleData.createdAt || now,
    updatedAt: now
  };
  await setDoc(doc(db, 'articles', id), article);
  return article;
}

export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  const ref = doc(db, 'articles', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const existing = snap.data() as Article;
  const updated: Article = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function deleteArticle(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'articles', id));
  return true;
}

export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const current = snap.data()?.views || 0;
      await updateDoc(ref, { views: current + 1 });
    }
  } catch (e) {
    // Non-blocking view increment
  }
}

// --- USERS ---
export async function getUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: User[] = [];
    snap.forEach(d => {
      const data = d.data() as User;
      list.push({ ...data, id: d.id });
    });
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getUsers error:', err.message);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', id));
    if (snap.exists()) {
      return { ...(snap.data() as User), id: snap.id };
    }
    return null;
  } catch (err: any) {
    console.error('[FIRESTORE] getUserById error:', err.message);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await getUsers();
    const norm = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === norm) || null;
  } catch (err: any) {
    console.error('[FIRESTORE] getUserByEmail error:', err.message);
    return null;
  }
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
  customId?: string
): Promise<User> {
  const id = customId || data.id || 'user-' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const user: User = {
    ...data,
    id,
    createdAt: data.createdAt || now,
    updatedAt: now
  };
  await setDoc(doc(db, 'users', id), user);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const ref = doc(db, 'users', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const existing = snap.data() as User;
  const updated: User = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };
  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'users', id));
  return true;
}

export async function ensureAdminUser(): Promise<void> {
  const ADMIN_EMAIL = 'uugankhuub@gmail.com';
  try {
    const existing = await getUserByEmail(ADMIN_EMAIL);
    if (!existing) {
      console.log(`[FIRESTORE] Seeding initial admin user: ${ADMIN_EMAIL}`);
      const { hashPassword } = await import('./auth.ts');
      const passwordHash = await hashPassword('Admin123!');
      await setDoc(doc(db, 'users', 'admin-1'), {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else if (existing.role !== 'ADMIN') {
      await updateUser(existing.id, { role: 'ADMIN' });
    }
  } catch (err: any) {
    console.error('[FIRESTORE] Error ensuring admin user:', err.message);
  }
}

// --- TAGS ---
export async function getTags(): Promise<Tag[]> {
  try {
    const snap = await getDocs(collection(db, 'tags'));
    const list: Tag[] = [];
    snap.forEach(d => list.push({ ...(d.data() as Tag), id: d.id }));
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getTags error:', err.message);
    return [];
  }
}

export async function createTag(name: string): Promise<Tag> {
  const id = 'tag-' + Math.random().toString(36).substring(2, 9);
  const tag: Tag = { id, name };
  await setDoc(doc(db, 'tags', id), tag);
  return tag;
}

export async function updateTag(id: string, name: string): Promise<Tag | null> {
  const ref = doc(db, 'tags', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const updated: Tag = { id, name };
  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function deleteTag(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'tags', id));
  return true;
}

// --- COMMENTS ---
export async function getComments(): Promise<Comment[]> {
  try {
    const snap = await getDocs(collection(db, 'comments'));
    const list: Comment[] = [];
    snap.forEach(d => list.push({ ...(d.data() as Comment), id: d.id }));
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getComments error:', err.message);
    return [];
  }
}

export async function updateCommentStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'): Promise<Comment | null> {
  const ref = doc(db, 'comments', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const updated = { ...(snap.data() as Comment), id, status };
  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function deleteComment(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'comments', id));
  return true;
}

// --- SETTINGS ---
export async function getSettings(): Promise<Setting[]> {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    const list: Setting[] = [];
    snap.forEach(d => list.push({ ...(d.data() as Setting), id: d.id }));
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getSettings error:', err.message);
    return [];
  }
}

export async function updateSettings(settingsList: Array<{ key: string; value: string }>): Promise<Setting[]> {
  for (const s of settingsList) {
    const id = 'set-' + s.key;
    await setDoc(doc(db, 'settings', id), { id, key: s.key, value: s.value }, { merge: true });
  }
  return getSettings();
}

// --- AUDIT LOGS ---
export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: AuditLog[] = [];
    snap.forEach(d => list.push({ ...(d.data() as AuditLog), id: d.id }));
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch (err: any) {
    console.error('[FIRESTORE] getAuditLogs error:', err.message);
    return [];
  }
}

export async function createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
  const id = 'log-' + Math.random().toString(36).substring(2, 9);
  const item: AuditLog = { ...log, id };
  await setDoc(doc(db, 'auditLogs', id), item);
  return item;
}
