/**
 * Site configuration and canonical URL helpers.
 *
 * Rules:
 * 1. process.env.SITE_URL takes precedence.
 * 2. Fallback: "https://my-first-app-channel-mongolia-production.up.railway.app".
 * 3. Trailing slash is strictly removed before building links.
 * 4. Article link format: ${SITE_URL}/article/${slug}.
 */

export const FALLBACK_SITE_URL = 'https://my-first-app-channel-mongolia-production.up.railway.app';

export const DEFAULT_PLACEHOLDER_IMAGE = '/placeholder-article.svg';

/**
 * Returns the cleaned SITE_URL without any trailing slashes.
 */
export function getSiteUrl(): string {
  // If running in browser, check window or import.meta.env, otherwise fallback to window.location.origin
  if (typeof window !== 'undefined') {
    const viteSiteUrl = (import.meta as any)?.env?.VITE_SITE_URL;
    if (viteSiteUrl && typeof viteSiteUrl === 'string') {
      return viteSiteUrl.replace(/\/+$/, '');
    }
    if (window.location && window.location.origin) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }

  // Server side
  const envUrl = process.env.SITE_URL || process.env.APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return FALLBACK_SITE_URL;
}

/**
 * Builds the canonical article URL: ${SITE_URL}/article/${slug}
 */
export function getArticleUrl(slugOrId: string): string {
  const base = getSiteUrl();
  const cleanSlug = encodeURIComponent(slugOrId || '');
  return `${base}/article/${cleanSlug}`;
}
