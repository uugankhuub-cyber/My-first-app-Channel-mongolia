import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Save, ArrowLeft, Image as ImageIcon, Globe, FileText, CheckCircle, 
  AlertTriangle, Sparkles, Sliders, Hash, Compass, Info, ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';

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
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [tags, setTags] = useState('');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
          // Fetch from list or fetch specific slug
          const artRes = await fetch('/api/articles');
          if (artRes.ok) {
            const articles = await artRes.json();
            const article = articles.find((a: any) => a.id === id);
            if (article) {
              setTitle(article.title);
              setSlug(article.slug);
              setExcerpt(article.excerpt || '');
              setContent(article.content);
              setThumbnail(article.thumbnail || '');
              setStatus(article.status);
              setCategoryId(article.categoryId || '');
              setMetaTitle(article.metaTitle || '');
              setMetaDesc(article.metaDesc || '');
              setTags(article.tags ? (Array.isArray(article.tags) ? article.tags.join(', ') : article.tags) : '');
            } else {
              setError('Нийтлэл олдсонгүй.');
            }
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
      categoryId: categoryId || undefined,
      metaTitle,
      metaDesc
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/articles" 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
        >
          <ArrowLeft size={14} />
          Буцах
        </Link>
        <span className="text-slate-500 font-mono text-xs flex items-center gap-1">
          <span>Admin</span> <ChevronRight size={12} /> <span>Articles</span> <ChevronRight size={12} /> <span>{isEdit ? 'Edit' : 'Create'}</span>
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="text-brand-purple" />
          <span>{isEdit ? 'Нийтлэл засварлах' : 'Шинэ нийтлэл оруулах'}</span>
        </h1>
        <p className="text-slate-400 text-sm">Сонгосон сэдвээр өндөр чанартай мэдээлэл бичиж вэбсайтдаа байршуулах хуудас</p>
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
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Нийтлэлийн өгөгдлийг татаж байна...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content block (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-bold text-md border-b border-white/5 pb-3">Үндсэн мэдээлэл</h3>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Нийтлэлийн гарчиг (Монгол хэлээр)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    required
                    placeholder="Энд нийтлэлийн үндсэн гарчгийг оруулна..."
                    className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
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
                <label className="text-slate-300 text-xs font-semibold">Хандмалын хаяг (Slug URL)</label>
                <input 
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="welcome-to-channel-mongolia"
                  className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Товч танилцуулга (Excerpt)</label>
                <textarea 
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Нийтлэлийн товч тайлбар. Жагсаалт дээр уншигчдад харагдах хэсэг..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors resize-none"
                />
              </div>

              {/* Rich Content Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs font-semibold">Нийтлэлийн үндсэн агуулга (Markdown/HTML дэмжинэ)</label>
                  <span className="text-[10px] text-slate-500 font-medium">Тэмдэгтийн тоо: {content.length}</span>
                </div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Нийтлэлийг дэлгэрэнгүйгээр энд бичнэ үү..."
                  rows={14}
                  className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                />
              </div>
            </div>

            {/* SEO Metadata panel */}
            <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-bold text-md border-b border-white/5 pb-3 flex items-center gap-1.5">
                <Globe size={16} className="text-brand-purple" />
                <span>SEO Тохиргоо</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold">Meta Гарчиг (SEO Title)</label>
                  <input 
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Хайлтын илэрц дээрх гарчиг..."
                    className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold">Сэдвийн түлхүүр үгс (Tags)</label>
                  <input 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="AI, Технологи, Сансар, ..."
                    className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Meta Тайлбар (SEO Description)</label>
                <textarea 
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Гүүгл дээр харагдах товч тайлбар хэсэг..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar block (right 1 col) */}
          <div className="space-y-6">
            {/* Status and Actions block */}
            <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-5">
              <h3 className="text-white font-bold text-md border-b border-white/5 pb-3 flex items-center gap-1.5">
                <Sliders size={16} className="text-brand-purple" />
                <span>Төлөв & Тохиргоо</span>
              </h3>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Нийтлэлийн төлөв</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-slate-300 text-sm outline-none focus:border-brand-purple/50 transition-colors"
                >
                  <option value="DRAFT">Ноорог (Зөвхөн редактор харах)</option>
                  <option value="PUBLISHED">Нийтлэх (Бүгдэд нээлттэй)</option>
                  <option value="ARCHIVED">Архивлах (Дарагдсан төлөв)</option>
                </select>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Үндсэн Ангилал</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-slate-300 text-sm outline-none focus:border-brand-purple/50 transition-colors"
                >
                  <option value="">Ангилалгүй (Ерөнхий)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Featured Image Thumbnail URL */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Нийтлэлийн зураг (Thumbnail URL)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <ImageIcon size={14} />
                  </span>
                  <input 
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-4 py-3 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-xs outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>
                {thumbnail && (
                  <div className="mt-2 w-full h-28 rounded-lg overflow-hidden border border-white/5">
                    <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-brand text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
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
            <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-3">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Бичигч редактор</h4>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-sm">
                  {user?.email?.substring(0, 1).toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="text-white text-sm font-bold truncate max-w-[180px]">{user?.email || 'editor@channel.mn'}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user?.role || 'EDITOR'}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
