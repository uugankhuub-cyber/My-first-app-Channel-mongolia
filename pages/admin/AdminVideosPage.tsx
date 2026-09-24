import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Pin, 
  Eye, 
  EyeOff, 
  Search, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Play, 
  ExternalLink,
  Youtube,
  Calendar,
  X
} from 'lucide-react';
import { VideoItem } from '../VideoPage';

export const AdminVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pinned' | 'hidden' | 'active'>('all');
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  const fetchVideosData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/videos?all=true${forceRefresh ? '&refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        setPinnedIds(data.pinnedVideoIds || []);
        setHiddenIds(data.hiddenVideoIds || []);
      }
    } catch (err) {
      console.error('Failed to load admin videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosData();
  }, []);

  const saveSettingsToFirestore = async (newPinned: string[], newHidden: string[]) => {
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch('/api/admin/videos/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinnedVideoIds: newPinned,
          hiddenVideoIds: newHidden
        })
      });

      if (res.ok) {
        setPinnedIds(newPinned);
        setHiddenIds(newHidden);
        // Update local videos state
        setVideos(prev =>
          prev.map(v => ({
            ...v,
            pinned: newPinned.includes(v.videoId),
            hidden: newHidden.includes(v.videoId)
          }))
        );
        setSaveMessage('Тохиргоо Firestore дээр амжилттай хадгалагдлаа!');
        setTimeout(() => setSaveMessage(null), 3500);
      } else {
        setSaveMessage('Хадгалахад алдаа гарлаа.');
      }
    } catch (err: any) {
      setSaveMessage(`Алдаа: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Pin
  const handleTogglePin = (videoId: string) => {
    let updated: string[];
    if (pinnedIds.includes(videoId)) {
      updated = pinnedIds.filter(id => id !== videoId);
    } else {
      updated = [videoId, ...pinnedIds]; // Add to front of pinned list
    }
    saveSettingsToFirestore(updated, hiddenIds);
  };

  // Toggle Hide
  const handleToggleHide = (videoId: string) => {
    let updated: string[];
    if (hiddenIds.includes(videoId)) {
      updated = hiddenIds.filter(id => id !== videoId);
    } else {
      updated = [...hiddenIds, videoId];
    }
    saveSettingsToFirestore(pinnedIds, updated);
  };

  // Filtered
  const filtered = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                          v.videoId.toLowerCase().includes(searchQuery.trim().toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'pinned') return pinnedIds.includes(v.videoId);
    if (filterTab === 'hidden') return hiddenIds.includes(v.videoId);
    if (filterTab === 'active') return !hiddenIds.includes(v.videoId);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600">
              <Tv size={24} />
            </div>
            <h1 className="text-2xl font-bold text-text-main">
              YouTube Видео удирдлага
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            Channel Mongolia YouTube сувгийн бичлэгүүдийг сайт дээр удирдах, эхэнд хадах болон сайтаас нуух тохиргоо (Firestore-д шууд хадгалагдана).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchVideosData(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-surfaceHighlight hover:bg-border text-text-main transition-colors border border-border"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Шинэчлэх (RSS)</span>
          </button>
          <a
            href="/#/video"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-purple text-white hover:bg-brand-purple/90 transition-colors shadow-sm"
          >
            <span>Сайт дээр харах</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${
          saveMessage.includes('амжилттай') 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
        }`}>
          {saveMessage.includes('амжилттай') ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium">Нийт бичлэг</p>
            <h3 className="text-2xl font-extrabold text-text-main mt-1">{videos.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
            <Youtube size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium">Эхэнд хадсан</p>
            <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{pinnedIds.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Pin size={24} className="rotate-45" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium">Сайтаас нуусан</p>
            <h3 className="text-2xl font-extrabold text-slate-500 mt-1">{hiddenIds.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center">
            <EyeOff size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'all', label: 'Бүгд', count: videos.length },
            { key: 'pinned', label: 'Хадаастай', count: pinnedIds.length },
            { key: 'active', label: 'Идэвхтэй', count: videos.length - hiddenIds.length },
            { key: 'hidden', label: 'Нуусан', count: hiddenIds.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterTab === tab.key
                  ? 'bg-brand-purple text-white'
                  : 'text-text-muted hover:text-text-main hover:bg-surfaceHighlight'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Бичлэгийн нэр эсвэл ID-аар хайх..."
            className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-surfaceHighlight border border-border text-text-main placeholder-text-muted focus:outline-none focus:border-brand-purple"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Videos Table/List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand-purple" />
            <p className="text-sm">Бичлэгүүдийг уншиж байна...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Tv size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Тохирох бичлэг олдсонгүй.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((video, idx) => {
              const isPinned = pinnedIds.includes(video.videoId);
              const isHidden = hiddenIds.includes(video.videoId);

              return (
                <div
                  key={video.videoId}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-surfaceHighlight/50 ${
                    isHidden ? 'opacity-60 bg-surfaceHighlight/20' : ''
                  }`}
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div 
                      onClick={() => setPreviewVideo(video)}
                      className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 cursor-pointer group shadow-sm border border-border"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <Play size={16} className="text-white fill-white" />
                      </div>
                      {isPinned && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-1 rounded-md shadow">
                          <Pin size={10} className="rotate-45 fill-slate-950" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 
                          onClick={() => setPreviewVideo(video)}
                          className="font-bold text-sm text-text-main hover:text-brand-purple cursor-pointer truncate"
                        >
                          {video.title}
                        </h4>
                        
                        {isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            📌 ЭХЭНД ХАДАСАН
                          </span>
                        )}
                        {isHidden && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            НҮҮСЭН
                          </span>
                        )}
                        {!isHidden && !isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ИДЭВХТЭЙ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="font-mono text-[11px]">ID: {video.videoId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(video.published).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    {/* Pin/Unpin */}
                    <button
                      onClick={() => handleTogglePin(video.videoId)}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isPinned
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-surfaceHighlight hover:bg-border text-text-muted hover:text-text-main border border-border'
                      }`}
                      title={isPinned ? 'Хадааснаас гаргах' : 'Эхэнд хадах'}
                    >
                      <Pin size={13} className={`rotate-45 ${isPinned ? 'fill-slate-950' : ''}`} />
                      <span>{isPinned ? 'Хадаас арилгах' : 'Эхэнд хадах'}</span>
                    </button>

                    {/* Hide/Unhide */}
                    <button
                      onClick={() => handleToggleHide(video.videoId)}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isHidden
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-surfaceHighlight hover:bg-border text-text-muted hover:text-text-main border border-border'
                      }`}
                      title={isHidden ? 'Буцааж харуулах' : 'Сайтаас нуух'}
                    >
                      {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{isHidden ? 'Харуулах' : 'Нуух'}</span>
                    </button>

                    {/* Preview Modal */}
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surfaceHighlight border border-border transition-colors"
                      title="Тоглуулж үзэх"
                    >
                      <Play size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Video Preview Modal */}
      {previewVideo && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewVideo(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-surfaceHighlight">
              <h3 className="font-bold text-sm text-text-main truncate pr-4">
                {previewVideo.title}
              </h3>
              <button 
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${previewVideo.videoId}?autoplay=1`}
                title={previewVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-4 flex items-center justify-between gap-4 bg-surface">
              <div className="text-xs text-text-muted">
                Нийтэлсэн: {new Date(previewVideo.published).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePin(previewVideo.videoId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surfaceHighlight hover:bg-border text-text-main border border-border flex items-center gap-1"
                >
                  <Pin size={12} className="rotate-45" />
                  <span>{pinnedIds.includes(previewVideo.videoId) ? 'Хадаас арилгах' : 'Эхэнд хадах'}</span>
                </button>
                <button
                  onClick={() => handleToggleHide(previewVideo.videoId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surfaceHighlight hover:bg-border text-text-main border border-border flex items-center gap-1"
                >
                  {hiddenIds.includes(previewVideo.videoId) ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{hiddenIds.includes(previewVideo.videoId) ? 'Харуулах' : 'Сайтаас нуух'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
