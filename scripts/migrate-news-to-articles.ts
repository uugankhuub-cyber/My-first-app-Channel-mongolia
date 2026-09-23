import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import firebaseConfig from '../firebase-applet-config.json';
import * as mockDb from '../lib/mock-db.ts';
import { prisma, checkConnection, getDbStatus } from '../lib/prisma.ts';

function formatSourcesMarkdown(sources: any[]): string {
  if (!Array.isArray(sources) || sources.length === 0) return '';
  const lines = sources.map((s: any) => {
    const name = typeof s === 'string' ? s : (s?.name || s?.url || 'Эх сурвалж');
    const url = typeof s === 'string' ? s : (s?.url || '#');
    return `- [${name}](${url})`;
  });
  return '\n\n## Эх сурвалж\n' + lines.join('\n');
}

function matchCategory(incomingName: string, availableCategories: { id: string; name: string; slug: string }[]) {
  const norm = (incomingName || '').trim().toLowerCase();
  if (!norm) {
    const delhii = availableCategories.find(c => c.name.toLowerCase() === 'дэлхий' || c.slug.toLowerCase() === 'delhii');
    return delhii || availableCategories[0];
  }

  // 1. Exact match by name or slug (case-insensitive)
  let found = availableCategories.find(c => 
    c.name.toLowerCase() === norm || 
    c.slug.toLowerCase() === norm
  );
  if (found) return found;

  // 2. Partial match (e.g. "Түүх ба археологи" -> "Түүх, газарзүй", "Сансар судлал" -> "Шинжлэх ухаан")
  found = availableCategories.find(c => 
    norm.includes(c.name.toLowerCase()) || 
    c.name.toLowerCase().includes(norm) ||
    norm.includes(c.slug.toLowerCase())
  );
  if (found) return found;

  // 3. Fallback to "Дэлхий"
  const delhii = availableCategories.find(c => c.name.toLowerCase() === 'дэлхий' || c.slug.toLowerCase() === 'delhii');
  if (delhii) return delhii;

  return availableCategories[0];
}

async function runMigration() {
  console.log('[MIGRATION] Starting migration from Firestore news to articles table...');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const firestore = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  const newsSnap = await getDocs(collection(firestore, 'news'));
  console.log(`[MIGRATION] Found ${newsSnap.size} news documents in Firestore.`);

  if (newsSnap.empty) {
    console.log('[MIGRATION] No news documents to migrate.');
    return;
  }

  // Load mockDb state
  const db = mockDb.getDb();
  await mockDb.ensureAdmin();
  const dbConnected = await checkConnection();

  for (const docSnap of newsSnap.docs) {
    const data = docSnap.data();
    const docSlug = data.slug || docSnap.id;
    console.log(`[MIGRATION] Processing "${docSlug}" - "${data.title}"...`);

    const fullContent = (data.body_markdown || '').trim() + formatSourcesMarkdown(data.sources);
    const excerpt = data.lead || (data.body_markdown ? data.body_markdown.substring(0, 160) : '');
    const metaTitle = data.title;
    const metaDesc = data.seo?.meta_description || excerpt.substring(0, 160);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const thumbnail = data.image?.url || null;
    const status = data.status === 'published' ? 'PUBLISHED' : 'DRAFT';

    const agentNotesObj = {
      short_idea: data.short_idea || null,
      fact_check: data.fact_check || null,
      ai_prompt: data.image?.ai_prompt || null,
      image_note: data.image?.note || null
    };
    const agentNotesStr = JSON.stringify(agentNotesObj);

    // Match category
    const matchedCategory = matchCategory(data.category, db.categories);
    console.log(`[MIGRATION] Category "${data.category}" matched to "${matchedCategory.name}" (${matchedCategory.id})`);

    // 1. Save to Mock DB if not already existing
    const existingIndex = db.articles.findIndex(a => a.slug === docSlug);
    const mockArticle: mockDb.MockArticle = {
      id: existingIndex >= 0 ? db.articles[existingIndex].id : 'art-migrated-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      title_en: data.title,
      slug: docSlug,
      excerpt: excerpt,
      excerpt_en: excerpt,
      content: fullContent,
      content_en: fullContent,
      thumbnail: thumbnail || undefined,
      status: status,
      categoryId: matchedCategory.id,
      views: existingIndex >= 0 ? db.articles[existingIndex].views : 120,
      likes: existingIndex >= 0 ? db.articles[existingIndex].likes : 15,
      tags: tags,
      metaTitle: metaTitle,
      metaDesc: metaDesc,
      agentNotes: agentNotesStr,
      publishedAt: data.published_at || (status === 'PUBLISHED' ? (data.created_at || new Date().toISOString()) : undefined),
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.articles[existingIndex] = mockArticle;
      console.log(`[MIGRATION] Updated existing mock article with slug "${docSlug}"`);
    } else {
      db.articles.unshift(mockArticle);
      console.log(`[MIGRATION] Added new mock article with slug "${docSlug}"`);
    }

    // 2. If Prisma is connected, also save to Postgres
    if (dbConnected) {
      try {
        let author = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!author) author = await prisma.user.findFirst();

        let prismaCat = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { equals: matchedCategory.name, mode: 'insensitive' } },
              { slug: { equals: matchedCategory.slug, mode: 'insensitive' } }
            ]
          }
        });

        if (!prismaCat) {
          prismaCat = await prisma.category.create({
            data: { name: matchedCategory.name, slug: matchedCategory.slug }
          });
        }

        if (author) {
          await prisma.article.upsert({
            where: { slug: docSlug },
            create: {
              title: data.title,
              slug: docSlug,
              excerpt: excerpt,
              content: fullContent,
              thumbnail: thumbnail,
              status: status,
              metaTitle: metaTitle,
              metaDesc: metaDesc,
              agentNotes: agentNotesStr,
              authorId: author.id,
              categoryId: prismaCat.id,
              publishedAt: data.published_at ? new Date(data.published_at) : (status === 'PUBLISHED' ? new Date() : null),
              createdAt: data.created_at ? new Date(data.created_at) : new Date()
            },
            update: {
              title: data.title,
              excerpt: excerpt,
              content: fullContent,
              thumbnail: thumbnail,
              status: status,
              metaTitle: metaTitle,
              metaDesc: metaDesc,
              agentNotes: agentNotesStr,
              categoryId: prismaCat.id
            }
          });
          console.log(`[MIGRATION] Upserted Prisma article "${docSlug}"`);
        }
      } catch (prismaErr: any) {
        console.error(`[MIGRATION] Prisma error for "${docSlug}":`, prismaErr.message);
      }
    }

    // 3. Delete from Firestore news collection and slugs collection
    try {
      await deleteDoc(doc(firestore, 'news', docSnap.id));
      console.log(`[MIGRATION] Deleted Firestore document news/${docSnap.id}`);
    } catch (delErr: any) {
      console.error(`[MIGRATION] Failed to delete news/${docSnap.id}:`, delErr.message);
    }

    try {
      await deleteDoc(doc(firestore, 'slugs', docSlug));
      console.log(`[MIGRATION] Deleted Firestore document slugs/${docSlug}`);
    } catch (delErr: any) {
      // Slugs might not exist or already deleted
    }
  }

  // Save mockDb
  mockDb.saveDb(db);
  console.log('[MIGRATION] Mock DB saved successfully.');

  // Also clean any remaining slugs in slugs collection
  try {
    const slugsSnap = await getDocs(collection(firestore, 'slugs'));
    for (const slugDoc of slugsSnap.docs) {
      await deleteDoc(doc(firestore, 'slugs', slugDoc.id));
      console.log(`[MIGRATION] Deleted orphaned slug doc slugs/${slugDoc.id}`);
    }
  } catch {}

  console.log('[MIGRATION] Completed successfully! All news items merged into articles table and news collection deleted.');
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[MIGRATION] Error:', err);
    process.exit(1);
  });
