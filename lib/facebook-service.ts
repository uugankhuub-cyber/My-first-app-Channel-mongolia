import * as db from './firestore-db.ts';

export interface FacebookPostResult {
  attempted: boolean;
  success: boolean;
  fbPostId?: string | null;
  fbShareStatus?: string;
  error?: string;
}

/**
 * Posts a published article to the Facebook Page via Facebook Graph API v26.0.
 *
 * Rules:
 * 1. Drafts are NEVER posted.
 * 2. An article is posted ONCE. If it has already succeeded (fbPostId or fbShareStatus === 'ok'),
 *    it will not be posted again unless forced retry on failure.
 * 3. A Facebook error must never block publishing on our site. Errors are saved to `fbShareStatus`.
 * 4. If thumbnail exists: POST https://graph.facebook.com/v26.0/{FB_PAGE_ID}/photos
 *    with url = article thumbnail, caption = ..., access_token = FB_PAGE_TOKEN.
 * 5. If no thumbnail: POST https://graph.facebook.com/v26.0/{FB_PAGE_ID}/feed
 *    with message = ..., link = article URL, access_token = FB_PAGE_TOKEN.
 */
export async function postArticleToFacebook(
  article: db.Article,
  siteOrigin: string,
  options?: { forceRetry?: boolean }
): Promise<FacebookPostResult> {
  // Guard 1: Drafts or non-published articles are NEVER posted to Facebook
  if (article.status !== 'PUBLISHED') {
    console.log(`[FACEBOOK] Ignored: article "${article.title}" (${article.id}) is ${article.status}. Drafts are NEVER posted.`);
    return {
      attempted: false,
      success: false,
      error: 'Drafts are NEVER posted to Facebook'
    };
  }

  // Guard 2: Never post the same article twice if already successfully posted
  if (!options?.forceRetry && (article.fbPostId || article.fbShareStatus === 'ok')) {
    console.log(`[FACEBOOK] Skipped: article "${article.title}" (${article.id}) already posted with ID ${article.fbPostId}.`);
    return {
      attempted: false,
      success: true,
      fbPostId: article.fbPostId,
      fbShareStatus: article.fbShareStatus || 'ok'
    };
  }

  const FB_PAGE_ID = process.env.FB_PAGE_ID?.trim();
  const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN?.trim();

  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
    const errorMsg = 'FB_PAGE_ID or FB_PAGE_TOKEN env vars missing on server';
    console.warn(`[FACEBOOK] Missing credentials: ${errorMsg}`);
    try {
      await db.updateArticle(article.id, {
        fbShareStatus: errorMsg
      });
    } catch (dbErr: any) {
      console.error('[FACEBOOK] Failed to record missing credentials on article:', dbErr.message);
    }
    return {
      attempted: true,
      success: false,
      fbShareStatus: errorMsg,
      error: errorMsg
    };
  }

  // Clean site origin from process.env.SITE_URL with required fallback
  const SITE_URL = (process.env.SITE_URL || siteOrigin || 'https://my-first-app-channel-mongolia-production.up.railway.app').replace(/\/+$/, '');
  const articleUrl = `${SITE_URL}/article/${article.slug || article.id}`;

  // Construct caption exactly as specified:
  // title + "\n\n" + excerpt + "\n\n👉 Дэлгэрэнгүй: " + article URL + "\n\n#ChannelMongolia #Мэдээ"
  const title = article.title || '';
  const excerpt = article.excerpt || (article.content ? article.content.substring(0, 160).replace(/\s+/g, ' ').trim() : '');
  const caption = `${title}\n\n${excerpt}\n\n👉 Дэлгэрэнгүй: ${articleUrl}\n\n#ChannelMongolia #Мэдээ`;

  // Determine whether we have an accessible thumbnail URL
  let photoUrl: string | null = null;
  if (article.thumbnail && typeof article.thumbnail === 'string' && article.thumbnail.trim()) {
    const thumb = article.thumbnail.trim();
    if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
      photoUrl = thumb;
    } else if (thumb.startsWith('/')) {
      photoUrl = `${SITE_URL}${thumb}`;
    }
  }

  console.log(`[FACEBOOK] Publishing article "${title}" to FB Page ${FB_PAGE_ID}... Photo: ${photoUrl || 'none'}`);

  try {
    let response: globalThis.Response;
    let endpointUrl = '';

    if (photoUrl) {
      // POST https://graph.facebook.com/v26.0/{FB_PAGE_ID}/photos
      endpointUrl = `https://graph.facebook.com/v26.0/${FB_PAGE_ID}/photos`;
      const body = new URLSearchParams();
      body.append('url', photoUrl);
      body.append('caption', caption);
      body.append('access_token', FB_PAGE_TOKEN);

      response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });
    } else {
      // POST https://graph.facebook.com/v26.0/{FB_PAGE_ID}/feed
      endpointUrl = `https://graph.facebook.com/v26.0/${FB_PAGE_ID}/feed`;
      const body = new URLSearchParams();
      body.append('message', caption);
      body.append('link', articleUrl);
      body.append('access_token', FB_PAGE_TOKEN);

      response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });
    }

    const data: any = await response.json();
    console.log(`[FACEBOOK] Graph API result [status ${response.status}]:`, JSON.stringify(data));

    if (response.ok && (data.id || data.post_id)) {
      const fbPostId = (data.post_id || data.id) as string;
      const now = new Date().toISOString();
      await db.updateArticle(article.id, {
        fbPostId,
        fbShareStatus: 'ok',
        fbPostedAt: now
      });
      console.log(`[FACEBOOK] Successfully posted article "${article.title}"! fbPostId: ${fbPostId}`);
      return {
        attempted: true,
        success: true,
        fbPostId,
        fbShareStatus: 'ok'
      };
    } else {
      const errorMsg = data?.error?.message 
        ? `(${data.error.code || 'error'}) ${data.error.message}`
        : `Facebook API HTTP ${response.status}: ${response.statusText}`;
      
      console.warn(`[FACEBOOK] Graph API error for article "${article.title}":`, errorMsg);
      await db.updateArticle(article.id, {
        fbShareStatus: errorMsg
      });

      return {
        attempted: true,
        success: false,
        fbShareStatus: errorMsg,
        error: errorMsg
      };
    }
  } catch (err: any) {
    console.error(`[FACEBOOK] Network or fetch error posting article "${article.title}":`, err);
    const errorMsg = err.message || 'Facebook Graph API connection failed';
    try {
      await db.updateArticle(article.id, {
        fbShareStatus: errorMsg
      });
    } catch (saveErr: any) {
      console.error('[FACEBOOK] Error updating article status:', saveErr.message);
    }
    return {
      attempted: true,
      success: false,
      fbShareStatus: errorMsg,
      error: errorMsg
    };
  }
}
