import { Request, Response } from 'express';
import * as db from '../lib/firestore-db.ts';
import fallbackVideosData from '../lib/channel-videos-data.json' assert { type: 'json' };

export interface VideoItem {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  author?: string;
  pinned?: boolean;
  hidden?: boolean;
}

const YOUTUBE_CHANNEL_ID = 'UC5gizP4Dg1qQb0Y3atfSZGQ';
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// In-memory cache pre-seeded with real Channel Mongolia videos
let videoCache: {
  timestamp: number;
  videos: VideoItem[];
} = {
  timestamp: Date.now(),
  videos: fallbackVideosData as VideoItem[]
};

// Helper to parse YouTube RSS XML
function parseYouTubeRss(xmlText: string): VideoItem[] {
  const items: VideoItem[] = [];
  const entryRegex = /<entry[\s\S]*?<\/entry>/g;
  const entries = xmlText.match(entryRegex) || [];

  for (const entry of entries) {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const thumbnailMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1].trim();
      const title = titleMatch ? titleMatch[1].trim() : 'Channel Mongolia Video';
      const published = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();
      const thumbnail = thumbnailMatch
        ? thumbnailMatch[1]
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      items.push({
        videoId,
        title,
        published,
        thumbnail,
        author: 'Channel Mongolia'
      });
    }
  }

  return items;
}

export async function fetchAndCacheVideos(forceRefresh = false): Promise<VideoItem[]> {
  const isExpired = Date.now() - videoCache.timestamp > CACHE_DURATION_MS;

  if (isExpired || forceRefresh) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(YOUTUBE_RSS_URL, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        const parsed = parseYouTubeRss(text);
        if (parsed.length > 0) {
          videoCache = {
            timestamp: Date.now(),
            videos: parsed
          };
          console.log(`[VIDEOS] Successfully fetched & parsed ${parsed.length} videos from YouTube RSS feed`);
        } else {
          console.warn('[VIDEOS] YouTube RSS returned empty entries, maintaining previous cache');
        }
      } else {
        console.warn(`[VIDEOS] YouTube RSS HTTP error: ${response.status}. Maintaining previous cache.`);
      }
    } catch (err: any) {
      console.warn('[VIDEOS] Fetch YouTube RSS failed, using last cache:', err.message);
    }
  }

  return videoCache.videos;
}

// 1. GET /api/videos
export async function handleGetVideos(req: Request, res: Response) {
  try {
    const force = req.query.refresh === 'true';
    const showAll = req.query.all === 'true'; // For admin views
    
    // 1. Fetch / get cached videos
    const rawVideos = await fetchAndCacheVideos(force);

    // 2. Fetch admin video settings from Firestore
    const settings = await db.getVideoSettings();
    const pinnedSet = new Set(settings.pinnedVideoIds || []);
    const hiddenSet = new Set(settings.hiddenVideoIds || []);

    // 3. Mark pinned and hidden flags
    let processed: VideoItem[] = rawVideos.map(v => ({
      ...v,
      pinned: pinnedSet.has(v.videoId),
      hidden: hiddenSet.has(v.videoId)
    }));

    // 4. If public request, filter out hidden videos
    if (!showAll) {
      processed = processed.filter(v => !v.hidden);
    }

    // 5. Sort: Pinned first (in the order specified in pinnedVideoIds), then newest by published date
    const pinnedList: VideoItem[] = [];
    const regularList: VideoItem[] = [];

    // Ensure pinned items appear in order of pinnedVideoIds array
    if (settings.pinnedVideoIds && settings.pinnedVideoIds.length > 0) {
      for (const pId of settings.pinnedVideoIds) {
        const match = processed.find(v => v.videoId === pId);
        if (match) {
          pinnedList.push(match);
        }
      }
    }

    for (const v of processed) {
      if (!pinnedSet.has(v.videoId)) {
        regularList.push(v);
      }
    }

    // Sort regular list by published date descending
    regularList.sort((a, b) => {
      const timeA = new Date(a.published).getTime();
      const timeB = new Date(b.published).getTime();
      return timeB - timeA;
    });

    const finalVideos = [...pinnedList, ...regularList];

    return res.status(200).json({
      ok: true,
      channel: {
        id: YOUTUBE_CHANNEL_ID,
        name: 'Channel Mongolia',
        subscribeUrl: `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}?sub_confirmation=1`,
        channelUrl: 'https://www.youtube.com/@ChannelMongolia'
      },
      total: finalVideos.length,
      pinnedVideoIds: settings.pinnedVideoIds,
      hiddenVideoIds: settings.hiddenVideoIds,
      videos: finalVideos,
      cachedAt: new Date(videoCache.timestamp).toISOString()
    });
  } catch (error: any) {
    console.error('[VIDEOS] handleGetVideos error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to retrieve videos',
      error: error.message
    });
  }
}

// 2. POST /api/videos/settings or /api/admin/videos/settings
export async function handleUpdateVideoSettings(req: Request, res: Response) {
  try {
    const { pinnedVideoIds, hiddenVideoIds } = req.body;

    const updated = await db.updateVideoSettings({
      pinnedVideoIds: Array.isArray(pinnedVideoIds) ? pinnedVideoIds : undefined,
      hiddenVideoIds: Array.isArray(hiddenVideoIds) ? hiddenVideoIds : undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Video settings updated in Firestore successfully',
      settings: updated
    });
  } catch (error: any) {
    console.error('[VIDEOS] handleUpdateVideoSettings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update video settings',
      error: error.message
    });
  }
}
