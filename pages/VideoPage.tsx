import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Youtube, 
  Calendar, 
  Search, 
  Pin, 
  Share2, 
  X, 
  ExternalLink, 
  Check, 
  Sparkles,
  ArrowLeft,
  Tv
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { useLanguage } from '../context/LanguageContext';

const { useParams, useNavigate, Link } = ReactRouterDOM;

export interface VideoItem {
  videoId: string;
  title: string;
  date?: string;
  published: string;
  thumbnail: string;
  author?: string;
  pinned?: boolean;
  hidden?: boolean;
}

interface VideosApiResponse {
  ok: boolean;
  channel: {
    id: string;
    name: string;
    subscribeUrl: string;
    channelUrl?: string;
  };
  total: number;
  pinnedVideoIds: string[];
  hiddenVideoIds: string[];
  videos: VideoItem[];
  cachedAt?: string;
}

export const VideoPage: React.FC = () => {
  const { videoId: routeVideoId } = useParams<{ videoId?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [channelInfo, setChannelInfo] = useState({
    name: 'Channel Mongolia',
    subscribeUrl: 'https://www.youtube.com/channel/UC5gizP4Dg1qQb0Y3atfSZGQ?sub_confirmation=1',
    id: 'UC5gizP4Dg1qQb0Y3atfSZGQ'
  });
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'pinned'>('all');

  // Fetch videos from /api/videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        const list: VideoItem[] = Array.isArray(data) ? data : (data.videos || []);
        // Sort newest first
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.date || a.published || 0).getTime();
          const dateB = new Date(b.date || b.published || 0).getTime();
          return dateB - dateA;
        });
        setVideos(sorted);
        if (!Array.isArray(data) && data.channel) {
          setChannelInfo(data.channel);
        }
      }
    } catch (err) {
      console.error('Failed to load videos from /api/videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Sync route param with selectedVideo for direct URLs like /video/:videoId
  useEffect(() => {
    if (routeVideoId && videos.length > 0) {
      const match = videos.find(v => v.videoId === routeVideoId);
      if (match) {
        setSelectedVideo(match);
      } else {
        // Create dynamic video item from videoId
        setSelectedVideo({
          videoId: routeVideoId,
          title: 'Channel Mongolia Video',
          published: new Date().toISOString(),
          thumbnail: `https://i.ytimg.com/vi/${routeVideoId}/hqdefault.jpg`
        });
      }
    } else if (!routeVideoId && selectedVideo) {
      // If url changed to /video, close modal
      setSelectedVideo(null);
    }
  }, [routeVideoId, videos]);

  const handleOpenVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    navigate(`/video/${video.videoId}`, { replace: false });
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    navigate('/video', { replace: false });
  };

  const handleCopyLink = () => {
    if (!selectedVideo) return;
    const shareUrl = `${window.location.origin}/video/${selectedVideo.videoId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filtered list
  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesFilter = filterType === 'pinned' ? !!v.pinned : true;
    return matchesSearch && matchesFilter;
  });

  const pinnedCount = videos.filter(v => !!v.pinned).length;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString(isEn ? 'en-US' : 'mn-MN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      {/* Top Banner & Channel Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface via-surfaceHighlight to-background py-10 md:py-14">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 -z-0 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -z-0 h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Left: Avatar & Channel Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[3px] shadow-lg shadow-red-500/20">
                  <div className="w-full h-full rounded-[13px] bg-slate-950 flex flex-col items-center justify-center text-white">
                    <span className="font-extrabold text-xl md:text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-amber-300">
                      CM
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Video</span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-background shadow">
                  <Youtube size={14} className="fill-white" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main">
                    {channelInfo.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    <Sparkles size={11} />
                    {isEn ? 'Official Channel' : 'Албан ёсны суваг'}
                  </span>
                </div>
                <p className="text-sm md:text-base text-text-muted leading-relaxed">
                  {isEn 
                    ? 'Watch our latest documentaries, science discoveries, and fascinating historical insights directly on our site.'
                    : 'Сонирхолтой баримт, түүх, шинжлэх ухааны тайлбарууд болон манай сувгийн онцлох бичлэгүүдийг сайт дээрээ шууд үзээрэй.'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-text-muted pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Tv size={14} className="text-red-500" />
                    {videos.length > 0 ? `${videos.length} ${isEn ? 'videos' : 'бичлэг'}` : (isEn ? 'Loading videos...' : 'Бичлэгүүдийг уншиж байна...')}
                  </span>
                  {pinnedCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Pin size={12} className="rotate-45" />
                      {pinnedCount} {isEn ? 'pinned' : 'онцолсон'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Red Subscribe Button */}
            <div className="flex-shrink-0">
              <a
                href={channelInfo.subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold text-sm md:text-base shadow-lg shadow-red-600/30 transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Subscribe to Channel Mongolia on YouTube"
              >
                <Youtube size={20} className="fill-white transition-transform group-hover:rotate-12" />
                <span>Subscribe</span>
                <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content & Video Grid */}
      <Container className="py-8">
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'bg-surfaceHighlight text-text-muted hover:text-text-main border border-border'
              }`}
            >
              {isEn ? 'All Videos' : 'Бүх бичлэгүүд'} ({videos.length})
            </button>
            {pinnedCount > 0 && (
              <button
                onClick={() => setFilterType('pinned')}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  filterType === 'pinned'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-surfaceHighlight text-text-muted hover:text-text-main border border-border'
                }`}
              >
                <Pin size={12} className="rotate-45" />
                {isEn ? 'Pinned' : 'Онцолсон'} ({pinnedCount})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search videos...' : 'Бичлэг хайх...'}
              className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm rounded-full bg-surfaceHighlight border border-border text-text-main placeholder-text-muted focus:outline-none focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden animate-pulse">
                <div className="aspect-video bg-surfaceHighlight w-full" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 bg-surfaceHighlight rounded w-3/4" />
                  <div className="h-3 bg-surfaceHighlight rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-surfaceHighlight/50 max-w-lg mx-auto">
            <Youtube size={48} className="mx-auto text-text-muted/40 mb-3" />
            <h3 className="text-lg font-bold text-text-main mb-1">
              {isEn ? 'No videos found' : 'Бичлэг олдсонгүй'}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {isEn 
                ? 'Try searching with another keyword or clear filters.'
                : 'Өөр түлхүүр үгээр хайх эсвэл хайлтын шүүлтүүрээ арилгана уу.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-surfaceHighlight hover:bg-border text-text-main transition-colors"
              >
                {isEn ? 'Clear Search' : 'Хайлт арилгах'}
              </button>
            )}
          </div>
        )}

        {/* Video Cards Grid: 1 col on mobile, 3 cols on desktop */}
        {!loading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <motion.article
                key={video.videoId}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleOpenVideo(video)}
                className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col bg-surface shadow-sm hover:shadow-xl ${
                  video.pinned
                    ? 'border-amber-500/40 dark:border-amber-500/30 hover:border-amber-500 ring-1 ring-amber-500/10'
                    : 'border-border hover:border-brand-purple/40 dark:hover:border-brand-purple/40'
                }`}
              >
                {/* 16:9 Thumbnail with Overlay */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to high quality or default image
                      const target = e.currentTarget;
                      if (!target.src.includes('hqdefault')) {
                        target.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
                      }
                    }}
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Red Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                      <Play size={22} className="fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Pinned Badge */}
                  {video.pinned && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-md">
                      <Pin size={12} className="rotate-45 fill-slate-950" />
                      <span>{isEn ? 'PINNED' : 'ОНЦОЛСОН'}</span>
                    </div>
                  )}

                  {/* Watch on Site Pill */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium tracking-wide">
                      HD 1080p
                    </span>
                  </div>
                </div>

                {/* Video Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h2 className="font-bold text-sm md:text-base leading-snug text-text-main group-hover:text-brand-purple transition-colors line-clamp-2">
                      {video.title}
                    </h2>
                  </div>

                  <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-text-muted" />
                      {formatDate(video.published)}
                    </span>
                    <span className="text-brand-purple font-semibold group-hover:underline flex items-center gap-1">
                      <Play size={11} className="fill-brand-purple" />
                      {isEn ? 'Watch on site' : 'Сайт дээр үзэх'}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </Container>

      {/* IN-SITE EMBEDDED VIDEO PLAYER MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={handleCloseVideo}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-surfaceHighlight">
                <div className="flex items-center gap-2 truncate pr-4">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                    <Youtube size={16} className="fill-white" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-text-main truncate">
                    {selectedVideo.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-surface transition-colors relative"
                    title={isEn ? 'Copy video link' : 'Холбоос хуулах'}
                  >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                  </button>
                  <button
                    onClick={handleCloseVideo}
                    className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                    aria-label="Close video player"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Embedded Player using youtube-nocookie.com embed as requested */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Video Bottom Panel */}
              <div className="p-4 sm:p-6 space-y-4 bg-surface">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-xl font-bold text-text-main leading-snug">
                      {selectedVideo.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(selectedVideo.published)}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-text-main">Channel Mongolia</span>
                      {selectedVideo.pinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                          Онцолсон бичлэг
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={channelInfo.subscribeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Youtube size={14} className="fill-white" />
                      <span>{isEn ? 'Subscribe' : 'Бүртгүүлэх'}</span>
                    </a>
                  </div>
                </div>

                {/* Next Videos in Channel */}
                {videos.length > 1 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      {isEn ? 'More Videos from Channel Mongolia' : 'Сувгийн бусад бичлэгүүд'}
                    </h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {videos
                        .filter(v => v.videoId !== selectedVideo.videoId)
                        .slice(0, 6)
                        .map(item => (
                          <div
                            key={item.videoId}
                            onClick={() => handleOpenVideo(item)}
                            className="flex-shrink-0 w-44 cursor-pointer group space-y-1.5"
                          >
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-border">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <Play size={14} className="text-white fill-white" />
                              </div>
                            </div>
                            <p className="text-xs font-medium text-text-main group-hover:text-brand-purple line-clamp-2 leading-tight">
                              {item.title}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
