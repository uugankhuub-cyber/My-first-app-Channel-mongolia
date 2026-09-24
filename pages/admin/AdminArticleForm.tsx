import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Save, ArrowLeft, Image as ImageIcon, Globe, FileText, CheckCircle, 
  AlertTriangle, Sparkles, Sliders, Hash, Compass, Info, ChevronRight,
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, 
  Eye, Edit3, AlignLeft, Wand2, Plus, CornerDownLeft, Bot, CheckCircle2, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { ArticleBodyRenderer } from '../../components/ArticleBodyRenderer';
import { ArticleImageGallery, ArticleImageItem } from '../../components/admin/ArticleImageGallery';
import { ImageInsertModal } from '../../components/admin/ImageInsertModal';

const { useParams, useNavigate, Link } = ReactRouterDOM;

export const AdminArticleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  // State fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [images, setImages] = useState<ArticleImageItem[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [postToFacebook, setPostToFacebook] = useState(true);
  const [fbPostId, setFbPostId] = useState<string | null>(null);
  const [fbShareStatus, setFbShareStatus] = useState<string | null>(null);
  const [fbRetrying, setFbRetrying] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [tags, setTags] = useState('');
  const [agentNotes, setAgentNotes] = useState('');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown or formatting tags into content textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Smart paragraph separator and cleaner
  const handleFormatParagraphs = () => {
    if (!content.trim()) return;

    let text = content.replace(/\r\n/g, '\n').trim();

    // Do not alter structured HTML
    const hasHtml = /<\s*(?:p|div|h[1-6]|ul|ol|blockquote)\b/i.test(text);
    if (hasHtml) {
      setSuccess('Агуулга нь аль хэдийн HTML бүтэцтэй байна.');
      return;
    }

    const lines = text.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Question detection e.g. "Яагаад 40,000 жилийн дараа ч ийм сайн хадгалагдсан бэ?"
      const isQuestionHeading = 
        /^(?:Яагаад|Тэгвэл|Энэ|Цус|Хэрхэн|Юу|Ямар|Хэзээ|Хэн|Хаана)[\s\S]{5,100}(?:\?|бэ\?|вэ\?|үү\?|үү|уу\?|уу)$/i.test(line) &&
        !line.startsWith('#') &&
        !line.startsWith('-') &&
        !line.startsWith('>');

      if (isQuestionHeading) {
        result.push(`### ${line}`);
      } else {
        result.push(line);
      }
    }

    const formatted = result.join('\n\n');
    setContent(formatted);
    setSuccess('Догол мөрүүдийг автоматаар засаж, асуулт дэд гарчгуудыг ялгалаа!');
  };

  // Auto slug generation helper
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit) {
      // Simple cyrillic-friendly / english-friendly slugification
      const clean = val
        .toLowerCase()
        .replace(/[^a-zA-Z0-9а-яА-ЯөӨүҮө\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      setSlug(clean);
    }
  };

  // Insert image markdown into content
  const handleInsertImageToContent = (imgUrl: string, captionText: string = '') => {
    const textarea = textareaRef.current;
    const caption = captionText.trim() || 'Зураг';
    const md = `\n\n![${caption}](${imgUrl})\n*${caption}*\n\n`;

    if (!textarea) {
      setContent(prev => prev + md);
      setSuccess(`"${caption}" нийтлэлийн төгсгөлд нэмэгдлээ.`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + md + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + md.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);

    setSuccess(`"${caption}" нийтлэл рүү оруулагдлаа.`);
  };

  // Upload new image files and return uploaded items
  const handleUploadNewImage = async (files: FileList | File[]): Promise<ArticleImageItem[] | void> => {
    if (!files || files.length === 0) return [];
    const uploadedList: ArticleImageItem[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const commaIndex = res.indexOf(',');
            resolve(commaIndex >= 0 ? res.substring(commaIndex + 1) : res);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await fetch('/api/admin-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileBase64: base64
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
            uploadedList.push({
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
              url: data.url,
              caption: cleanName
            });
          }
        }
      }

      if (uploadedList.length > 0) {
        setImages(prev => [...prev, ...uploadedList]);
        if (!thumbnail) {
          setThumbnail(uploadedList[0].url);
        }
        setSuccess(`${uploadedList.length} зураг амжилттай байршлаа.`);
      }
    } catch (err: any) {
      setError('Зураг хуулахад алдаа гарлаа: ' + err.message);
    }
    return uploadedList;
  };

  // Fetch initial content and categories
  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        // Load categories
        const catRes = await fetch('/api/admin/categories', {
          credentials: 'include'
        });
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data);
        }

        // Load article if edit mode
        if (isEdit) {
          // Fetch from admin endpoint which includes private agentNotes
          let article: any = null;
          const adminArtRes = await fetch(`/api/admin/articles/${id}`, { credentials: 'include' });
          if (adminArtRes.ok) {
            article = await adminArtRes.json();
          } else {
            const artRes = await fetch('/api/admin/articles', { credentials: 'include' });
            if (artRes.ok) {
              const articles = await artRes.json();
              article = articles.find((a: any) => a.id === id);
            }
          }

          if (article) {
            setTitle(article.title || '');
            setSlug(article.slug || '');
            setExcerpt(article.excerpt || '');
            setContent(article.content || '');
            setThumbnail(article.thumbnail || '');
            setStatus(article.status || 'DRAFT');
            setCategoryId(article.categoryId || '');
            setMetaTitle(article.metaTitle || '');
            setMetaDesc(article.metaDesc || '');
            setFbPostId(article.fbPostId || null);
            setFbShareStatus(article.fbShareStatus || null);
            
            const rawNotes = article.agentNotes;
            setAgentNotes(typeof rawNotes === 'string' ? rawNotes : (rawNotes ? JSON.stringify(rawNotes, null, 2) : ''));

            const rawTags = article.tags;
            if (Array.isArray(rawTags)) {
              setTags(rawTags.map((t: any) => typeof t === 'string' ? t : (t?.name || '')).filter(Boolean).join(', '));
            } else if (typeof rawTags === 'string') {
              setTags(rawTags);
            } else {
              setTags('');
            }

            const rawImages = article.images;
            if (Array.isArray(rawImages)) {
              setImages(rawImages.map((img: any, idx: number) => {
                if (typeof img === 'string') {
                  return { id: 'img-' + idx + '-' + Date.now(), url: img, caption: '' };
                }
                return {
                  id: img.id || ('img-' + idx + '-' + Date.now()),
                  url: img.url || '',
                  caption: img.caption || ''
                };
              }));
            } else {
              setImages([]);
            }
          } else {
            setError('Нийтлэл олдсонгүй.');
          }
        }
      } catch (e) {
        console.error(e);
        setError('Шаардлагатай мэдээллийг татахад алдаа гарлаа.');
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  // Handle AI Content Assistant
  const handleAIAssist = async () => {
    if (!title) {
      setError('Эхлээд гарчиг оруулна уу.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-ai-content', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: `Write a high-quality summary excerpt and a detailed blog article content about the topic: ${title}. Keep it highly professional, clean, and styled nicely.` })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestion) {
          setContent(data.suggestion);
          setExcerpt(data.suggestion.substring(0, 150) + '...');
          setSuccess('AI-ийн тусламжтай нийтлэлийг амжилттай бэлтгэлээ!');
        }
      } else {
        throw new Error('AI холболтод алдаа гарлаа.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      setError('Гарчиг, хаяг болон агуулга заавал байх ёстой.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      status,
      postToFacebook,
      categoryId: categoryId || undefined,
      metaTitle,
      metaDesc,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      images: images.map(img => ({ url: img.url, caption: img.caption })),
      agentNotes: agentNotes || undefined
    };

    try {
      const url = isEdit ? `/api/admin/articles/${id}` : '/api/admin/articles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedArt = await res.json();
        if (savedArt?.fbShareStatus) setFbShareStatus(savedArt.fbShareStatus);
        if (savedArt?.fbPostId) setFbPostId(savedArt.fbPostId);
        setSuccess(isEdit ? 'Амжилттай хадгалагдлаа!' : 'Шинэ нийтлэл амжилттай үүсгэгдлээ!');
        setTimeout(() => {
          navigate('/admin/articles');
        }, 1200);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Нийтлэлийг хадгалахад алдаа гарлаа.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Retry Facebook auto-post handler
  const handleRetryFacebook = async () => {
    if (!id) return;
    setFbRetrying(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}/facebook-retry`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.fbShareStatus) {
        setFbShareStatus(data.fbShareStatus);
      }
      if (data.fbPostId) {
        setFbPostId(data.fbPostId);
      }
      if (data.success) {
        setSuccess('Facebook хуудсанд амжилттай нийтлэгдлээ!');
      } else {
        setError(`Facebook нийтлэхэд алдаа гарлаа: ${data.fbShareStatus || data.error || 'Тодорхойгүй алдаа'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Facebook дахин илгээх холболтод алдаа гарлаа.');
    } finally {
      setFbRetrying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/articles" 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-surfaceHighlight hover:bg-white/10 rounded-xl text-text-main hover:text-text-main text-xs font-semibold border border-border transition-colors"
        >
          <ArrowLeft size={14} />
          Буцах
        </Link>
        <span className="text-text-muted font-mono text-xs flex items-center gap-1">
          <span>Admin</span> <ChevronRight size={12} /> <span>Articles</span> <ChevronRight size={12} /> <span>{isEdit ? 'Edit' : 'Create'}</span>
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
          <FileText className="text-brand-purple" />
          <span>{isEdit ? 'Нийтлэл засварлах' : 'Шинэ нийтлэл оруулах'}</span>
        </h1>
        <p className="text-text-muted text-sm">Сонгосон сэдвээр өндөр чанартай мэдээлэл бичиж вэбсайтдаа байршуулах хуудас</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {fetching ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-muted text-sm">Нийтлэлийн өгөгдлийг татаж байна...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content block (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
              <h3 className="text-text-main font-bold text-md border-b border-border pb-3">Үндсэн мэдээлэл</h3>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Нийтлэлийн гарчиг (Монгол хэлээр)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    required
                    placeholder="Энд нийтлэлийн үндсэн гарчгийг оруулна..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={loading}
                    title="AI-аар контент бичүүлэх"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-brand-purple/15 text-brand-purple rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles size={14} className={loading ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-bold">AI Assistant</span>
                  </button>
                </div>
              </div>

              {/* URL Slug input */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Хандмалын хаяг (Slug URL)</label>
                <input 
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="welcome-to-channel-mongolia"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Товч танилцуулга (Excerpt)</label>
                <textarea 
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Нийтлэлийн товч тайлбар. Жагсаалт дээр уншигчдад харагдах хэсэг..."
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors resize-none"
                />
              </div>

              {/* Rich Content Area */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-3">
                    <label className="text-text-main text-xs font-semibold">Нийтлэлийн үндсэн агуулга</label>
                    <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setEditorTab('edit')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                          editorTab === 'edit' 
                            ? 'bg-brand-purple text-white shadow-sm font-semibold' 
                            : 'text-text-muted hover:text-text-main'
                        }`}
                      >
                        <Edit3 size={12} />
                        <span>Засварлах</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                          editorTab === 'preview' 
                            ? 'bg-brand-purple text-white shadow-sm font-semibold' 
                            : 'text-text-muted hover:text-text-main'
                        }`}
                      >
                        <Eye size={12} />
                        <span>Урьдчилан харах</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFormatParagraphs}
                      title="Бүх текстийг шинжилж, догол мөр болон дэд асуултуудыг автоматаар цэгцлэх"
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surfaceHighlight hover:bg-brand-purple/15 text-text-muted hover:text-brand-purple border border-border flex items-center gap-1.5 transition-colors"
                    >
                      <Wand2 size={13} className="text-brand-orange" />
                      <span>Догол мөр цэгцлэх</span>
                    </button>
                    <span className="text-[10px] text-text-muted font-medium font-mono">
                      {content.length} тэмдэгт
                    </span>
                  </div>
                </div>

                {editorTab === 'edit' ? (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-background border border-border rounded-xl text-text-muted">
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n## ', '\n', 'Үндсэн гарчиг')}
                        title="Гарчиг 2 (H2)"
                        className="px-2 py-1 hover:bg-surfaceHighlight hover:text-text-main rounded text-xs font-bold transition-colors"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n### ', '\n', 'Дэд гарчиг')}
                        title="Дэд гарчиг (H3)"
                        className="px-2 py-1 hover:bg-surfaceHighlight hover:text-text-main rounded text-xs font-bold transition-colors"
                      >
                        H3
                      </button>
                      <div className="w-px h-4 bg-border mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**', 'тод үг')}
                        title="Тод бичиг (Bold)"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*', 'налуу үг')}
                        title="Налуу бичиг (Italic)"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <Italic size={14} />
                      </button>
                      <div className="w-px h-4 bg-border mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n> ', '\n', 'Онцлох ишлэл энд бичнэ...')}
                        title="Ишлэл блок"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <Quote size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n- ', '\n', 'Жагсаалтын зүйл')}
                        title="Жагсаалт"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <List size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n1. ', '\n', 'Эхний зүйл')}
                        title="Дугаарласан жагсаалт"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <ListOrdered size={14} />
                      </button>
                      <div className="w-px h-4 bg-border mx-1" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n\n', '', '')}
                        title="Шинэ догол мөр үүсгэх (Enter)"
                        className="px-2 py-1 hover:bg-surfaceHighlight hover:text-text-main rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <CornerDownLeft size={12} />
                        <span>Догол мөр</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        title="Зураг оруулах (Файл хуулах, цомгоос сонгох, холбоос оруулах)"
                        className="px-2.5 py-1 bg-brand-purple/10 hover:bg-brand-purple hover:text-white text-brand-purple rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <ImageIcon size={13} />
                        <span>Зураг оруулах</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Холбох URL хаягийг оруулна уу:');
                          if (url) insertFormatting('[', `](${url})`, 'Холбоосын нэр');
                        }}
                        title="Холбоос нэмэх"
                        className="p-1.5 hover:bg-surfaceHighlight hover:text-text-main rounded transition-colors"
                      >
                        <Link2 size={14} />
                      </button>
                    </div>

                    {/* Textarea */}
                    <textarea 
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      placeholder="Нийтлэлийг дэлгэрэнгүйгээр энд бичнэ үү... (Догол мөрүүдийг Enter дарж зайтай бичнэ)"
                      rows={16}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-base outline-none focus:border-brand-purple/50 transition-colors font-mono leading-relaxed"
                    />
                    
                    <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                      <span>💡 <strong>Зөвлөмж:</strong> Догол мөр бүрийн хооронд Enter дарж 1 зайтай бичвэл уншихад цэгцтэй харагдана.</span>
                      <button 
                        type="button" 
                        onClick={handleFormatParagraphs}
                        className="text-brand-purple hover:underline"
                      >
                        Автоматаар цэгцлэх
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Live Preview Box */
                  <div className="bg-background border border-border rounded-xl p-6 min-h-[350px] overflow-y-auto">
                    {content.trim() ? (
                      <ArticleBodyRenderer content={content} />
                    ) : (
                      <div className="text-center py-16 text-text-muted text-sm">
                        Урьдчилан харах агуулга хоосон байна. "Засварлах" хэсэгт нийтлэлээ бичнэ үү.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Article Multi-Image Gallery */}
            <ArticleImageGallery
              images={images}
              onImagesChange={setImages}
              onInsertToContent={handleInsertImageToContent}
              onSetThumbnail={(url) => {
                setThumbnail(url);
                setSuccess('Нүүр зураг солигдлоо!');
              }}
              currentThumbnail={thumbnail}
            />

            {/* SEO Metadata panel */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
              <h3 className="text-text-main font-bold text-md border-b border-border pb-3 flex items-center gap-1.5">
                <Globe size={16} className="text-brand-purple" />
                <span>SEO Тохиргоо</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-main text-xs font-semibold">Meta Гарчиг (SEO Title)</label>
                  <input 
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Хайлтын илэрц дээрх гарчиг..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-main text-xs font-semibold">Сэдвийн түлхүүр үгс (Tags)</label>
                  <input 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="AI, Технологи, Сансар, ..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Meta Тайлбар (SEO Description)</label>
                <textarea 
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Гүүгл дээр харагдах товч тайлбар хэсэг..."
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Agent Notes (Internal & Private for Admin Editor only) */}
            <div className="bg-surface border border-brand-purple/30 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-brand-purple" />
                  <h3 className="text-text-main font-bold text-sm">AI Агент тэмдэглэл & Баримт шалгалт (Зөвхөн админ харна)</h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-brand-purple/15 text-brand-purple font-semibold border border-brand-purple/20">
                  Дотоод нууцлалтай
                </span>
              </div>

              {(() => {
                let parsed: any = null;
                if (agentNotes) {
                  try {
                    parsed = typeof agentNotes === 'string' ? JSON.parse(agentNotes) : agentNotes;
                  } catch (e) {
                    parsed = null;
                  }
                }

                // Helper to never render raw objects as React children
                const safeText = (val: any): string => {
                  if (val === null || val === undefined) return '';
                  return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
                };

                return (
                  <div className="space-y-4">
                    {parsed && (
                      <div className="space-y-3">
                        {parsed.short_idea && (
                          <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
                            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider block">
                              Богино санаа:
                            </span>
                            {typeof parsed.short_idea === 'object' && parsed.short_idea !== null ? (
                              <div className="space-y-2 text-sm text-text-main pt-1">
                                {parsed.short_idea.hook !== undefined && (
                                  <div className="p-2.5 bg-surfaceHighlight rounded-lg">
                                    <span className="text-xs font-bold text-text-muted block mb-0.5">Hook:</span>
                                    <p className="text-text-main font-medium whitespace-pre-wrap">
                                      {safeText(parsed.short_idea.hook)}
                                    </p>
                                  </div>
                                )}
                                {parsed.short_idea.outline !== undefined && (
                                  <div className="p-2.5 bg-surfaceHighlight rounded-lg">
                                    <span className="text-xs font-bold text-text-muted block mb-0.5">Outline:</span>
                                    <p className="text-text-main whitespace-pre-wrap">
                                      {safeText(parsed.short_idea.outline)}
                                    </p>
                                  </div>
                                )}
                                {!('hook' in parsed.short_idea) && !('outline' in parsed.short_idea) && (
                                  <pre className="text-xs font-mono bg-surfaceHighlight p-2 rounded whitespace-pre-wrap">
                                    {safeText(parsed.short_idea)}
                                  </pre>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                                {safeText(parsed.short_idea)}
                              </p>
                            )}
                          </div>
                        )}

                        {parsed.fact_check && (
                          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                              <CheckCircle2 size={14} />
                              Баримт шалгалт (Fact Check):
                            </span>
                            {Array.isArray(parsed.fact_check) ? (
                              <ul className="list-disc list-inside text-sm text-text-main space-y-1">
                                {parsed.fact_check.map((item: any, idx: number) => (
                                  <li key={idx} className="leading-relaxed">
                                    {safeText(item)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                                {safeText(parsed.fact_check)}
                              </p>
                            )}
                          </div>
                        )}

                        {parsed.ai_prompt && (
                          <div className="p-3.5 bg-background border border-border rounded-xl">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                              Зургийн AI Prompt:
                            </span>
                            <p className="text-xs font-mono text-text-muted bg-surfaceHighlight p-2 rounded-lg whitespace-pre-wrap">
                              {safeText(parsed.ai_prompt)}
                            </p>
                          </div>
                        )}

                        {parsed.image_note && (
                          <div className="p-3.5 bg-background border border-border rounded-xl">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                              Зургийн тэмдэглэл:
                            </span>
                            <p className="text-xs text-text-muted whitespace-pre-wrap">
                              {safeText(parsed.image_note)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-text-muted text-xs font-medium">Түүхий тэмдэглэл (JSON эсвэл текст)</label>
                      <textarea
                        value={typeof agentNotes === 'string' ? agentNotes : (agentNotes ? JSON.stringify(agentNotes, null, 2) : '')}
                        onChange={(e) => setAgentNotes(e.target.value)}
                        placeholder="short_idea, fact_check, ai_prompt зэрэг дотоод тэмдэглэл..."
                        rows={parsed ? 2 : 4}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-xs font-mono outline-none focus:border-brand-purple/50 transition-colors"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sidebar block (right 1 col) */}
          <div className="space-y-6">
            {/* Status and Actions block */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
              <h3 className="text-text-main font-bold text-md border-b border-border pb-3 flex items-center gap-1.5">
                <Sliders size={16} className="text-brand-purple" />
                <span>Төлөв & Тохиргоо</span>
              </h3>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Нийтлэлийн төлөв</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                >
                  <option value="DRAFT">Ноорог (Зөвхөн редактор харах)</option>
                  <option value="PUBLISHED">Нийтлэх (Бүгдэд нээлттэй)</option>
                  <option value="ARCHIVED">Архивлах (Дарагдсан төлөв)</option>
                </select>
              </div>

              {/* Facebook Auto-Post Configuration */}
              <div className="p-3.5 bg-background border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={postToFacebook}
                      onChange={(e) => setPostToFacebook(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                    />
                    <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#1877F2] fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook-т нийтлэх
                    </span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold">
                    Auto-post
                  </span>
                </div>

                {/* Facebook Share Status Indicator */}
                {fbPostId || fbShareStatus === 'ok' ? (
                  <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                      <CheckCircle2 size={13} />
                      <span>Facebook-т амжилттай нийтлэгдсэн</span>
                    </div>
                    {fbPostId && (
                      <p className="text-[10px] font-mono text-text-muted break-all">
                        Post ID: {fbPostId}
                      </p>
                    )}
                  </div>
                ) : fbShareStatus && fbShareStatus !== 'ok' ? (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                    <div className="flex items-start gap-1.5 text-xs font-semibold text-amber-500">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span>Facebook нийтлэл амжилтгүй:</span>
                        <p className="text-[11px] font-normal text-text-muted mt-0.5 break-words">
                          {fbShareStatus}
                        </p>
                      </div>
                    </div>
                    {isEdit && (
                      <button
                        type="button"
                        onClick={handleRetryFacebook}
                        disabled={fbRetrying}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {fbRetrying ? (
                          <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <RefreshCw size={13} />
                        )}
                        <span>Дахин оролдох</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted leading-tight">
                    {status === 'PUBLISHED' 
                      ? 'Хадгалах үед Facebook хуудсанд автоматаар нийтлэгдэнэ.' 
                      : 'Ноорог төлөвт Facebook-т нийтлэгдэхгүй. Нийтлэх (PUBLISHED) үед автоматаар Facebook хуудас руу орно.'}
                  </p>
                )}
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Үндсэн Ангилал</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                >
                  <option value="">Ангилалгүй (Ерөнхий)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Featured Image Thumbnail URL */}
              <div className="space-y-1.5">
                <label className="text-text-main text-xs font-semibold">Нийтлэлийн зураг (Thumbnail URL)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <ImageIcon size={14} />
                  </span>
                  <input 
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-text-main text-xs outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>
                {thumbnail && (
                  <div className="mt-2 w-full h-28 rounded-lg overflow-hidden border border-border">
                    <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {images.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-text-muted block mb-1.5">
                      Цомгийн зургуудаас сонгох:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => {
                            setThumbnail(img.url);
                            setSuccess('Нүүр зураг солигдлоо!');
                          }}
                          className={`relative w-11 h-11 rounded-lg overflow-hidden border transition-all ${
                            thumbnail === img.url
                              ? 'border-brand-purple ring-2 ring-brand-purple'
                              : 'border-border hover:border-brand-purple/50 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          {thumbnail === img.url && (
                            <div className="absolute inset-0 bg-brand-purple/40 flex items-center justify-center text-white">
                              <CheckCircle2 size={14} className="stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-brand text-text-main rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{isEdit ? 'Засварыг Хадгалах' : 'Нийтлэлийг Нийтлэх'}</span>
              </button>
            </div>

            {/* Author box */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
              <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider">Бичигч редактор</h4>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-sm">
                  {user?.email?.substring(0, 1).toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="text-text-main text-sm font-bold truncate max-w-[180px]">{user?.email || 'editor@channel.mn'}</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{user?.role || 'EDITOR'}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Quick Image Insertion Modal */}
      <ImageInsertModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={handleInsertImageToContent}
        galleryImages={images}
        onUploadNewImage={handleUploadNewImage}
      />
    </div>
  );
};
