import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  auth,
  db,
  ADMIN_EMAIL,
  loginWithGoogle,
  loginWithGoogleRedirect,
  checkRedirectResult,
  logoutUser,
  handleFirestoreError,
  OperationType
} from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { NewsItem } from '../../types/news';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import DOMPurify from 'dompurify';
import {
  ShieldAlert,
  LogIn,
  LogOut,
  Newspaper,
  CheckCircle,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  FileText,
  Calendar,
  Layers,
  Search,
  Sparkles,
  Activity
} from 'lucide-react';

const { Link } = ReactRouterDOM;

export const AdminNewsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);

  // News items
  const [drafts, setDrafts] = useState<NewsItem[]>([]);
  const [published, setPublished] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');
  const [loadingNews, setLoadingNews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Health status check
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);

  // Modals
  const [previewArticle, setPreviewArticle] = useState<NewsItem | null>(null);
  const [editingArticle, setEditingArticle] = useState<NewsItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editLead, setEditLead] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Create form state
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLead, setNewLead] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('Мэдээ');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSources, setNewSources] = useState('Монцамэ, https://montsame.mn');
  const [creatingSubmitting, setCreatingSubmitting] = useState(false);

  // Auth observer & Redirect result handler
  useEffect(() => {
    checkRedirectResult()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          if (user.email !== ADMIN_EMAIL) {
            setAuthError(`Хандах эрхгүй: Таны ${user.email} хаяг админ биш байна. Зөвхөн ${ADMIN_EMAIL} зөвшөөрөгдөнө.`);
          }
        }
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Health check
  useEffect(() => {
    fetch('/api/news/health')
      .then((res) => res.json())
      .then((data) => setApiHealth(data?.ok === true))
      .catch(() => setApiHealth(false));
  }, []);

  const isAuthorizedAdmin = currentUser && currentUser.email === ADMIN_EMAIL;

  // Load articles
  const fetchNews = async () => {
    if (!isAuthorizedAdmin) return;
    setLoadingNews(true);
    setActionError(null);

    try {
      // 1. Fetch Drafts
      const qDrafts = query(collection(db, 'news'), where('status', '==', 'draft'));
      const draftSnap = await getDocs(qDrafts);
      const draftList: NewsItem[] = [];
      draftSnap.forEach((d) => {
        draftList.push({ id: d.id, ...(d.data() as NewsItem) });
      });

      // 2. Fetch Published
      const qPublished = query(collection(db, 'news'), where('status', '==', 'published'));
      const pubSnap = await getDocs(qPublished);
      const pubList: NewsItem[] = [];
      pubSnap.forEach((d) => {
        pubList.push({ id: d.id, ...(d.data() as NewsItem) });
      });

      // Sort newest first
      const sorter = (a: NewsItem, b: NewsItem) =>
        new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();

      setDrafts(draftList.sort(sorter));
      setPublished(pubList.sort(sorter));
    } catch (err: any) {
      console.error('Error fetching admin news:', err);
      setActionError('Мэдээний жагсаалт авахад алдаа гарлаа: ' + err.message);
      try {
        handleFirestoreError(err, OperationType.LIST, 'news');
      } catch {}
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchNews();
    }
  }, [isAuthorizedAdmin]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setPopupBlocked(false);
    setPopupClosed(false);
    try {
      const user = await loginWithGoogle();
      if (user.email !== ADMIN_EMAIL) {
        setAuthError(`Хандах эрхгүй: Таны ${user.email} хаяг админ биш байна. Зөвхөн ${ADMIN_EMAIL} зөвшөөрөгдөнө.`);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        setPopupBlocked(true);
        setAuthError('Хөтөч pop-up цонхыг хаасан байна. Хөтчийн хаягийн мөрний баруун талд байрлах Pop-up тохиргоог зөвшөөрөөд (Allow popups) дахин оролдоно уу.');
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        setPopupClosed(true);
        setAuthError('Нэвтрэх цонх автоматаар хаагдсан эсвэл цуцлагдсан байна.');
      } else {
        setAuthError(msg || 'Google нэвтрэлт амжилтгүй боллоо');
      }
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.error('Google Redirect failed:', err);
      setAuthError(err?.message || 'Шилжин нэвтрэхэд алдаа гарлаа');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // 1. Publish Button: status -> published, set published_at
  const handlePublish = async (article: NewsItem) => {
    if (!window.confirm(`"${article.title}" мэдээг нийтлэх үү?`)) return;

    setActionError(null);
    try {
      const docRef = doc(db, 'news', article.slug);
      const now = new Date().toISOString();
      await updateDoc(docRef, {
        status: 'published',
        published_at: now
      });

      setActionSuccess(`"${article.title}" амжилттай нийтлэгдлээ!`);
      setTimeout(() => setActionSuccess(null), 4000);
      await fetchNews();
    } catch (err: any) {
      console.error('Error publishing news:', err);
      setActionError('Нийтлэхэд алдаа гарлаа: ' + err.message);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `news/${article.slug}`);
      } catch {}
    }
  };

  // 2. Edit Button: title, lead, body, image url
  const openEditModal = (article: NewsItem) => {
    setEditingArticle(article);
    setEditTitle(article.title || '');
    setEditLead(article.lead || '');
    setEditBody(article.body_markdown || '');
    setEditImageUrl(article.image?.url || '');
    setEditCategory(article.category || 'General');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setSavingEdit(true);
    setActionError(null);
    try {
      const docRef = doc(db, 'news', editingArticle.slug);
      const updatePayload: any = {
        title: editTitle.trim(),
        lead: editLead.trim(),
        body_markdown: editBody.trim(),
        category: editCategory.trim()
      };

      if (editImageUrl.trim()) {
        updatePayload['image.url'] = editImageUrl.trim();
      }

      await updateDoc(docRef, updatePayload);

      setActionSuccess('Мэдээ амжилттай засварлагдлаа!');
      setTimeout(() => setActionSuccess(null), 4000);
      setEditingArticle(null);
      await fetchNews();
    } catch (err: any) {
      console.error('Error updating news:', err);
      setActionError('Засварлахад алдаа гарлаа: ' + err.message);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `news/${editingArticle.slug}`);
      } catch {}
    } finally {
      setSavingEdit(false);
    }
  };

  // 3. Delete Button: remove from news and slugs
  const handleDelete = async (article: NewsItem) => {
    if (!window.confirm(`Та "${article.title}" мэдээг устгахдаа итгэлтэй байна уу?`)) return;

    setActionError(null);
    try {
      await deleteDoc(doc(db, 'news', article.slug));
      try {
        await deleteDoc(doc(db, 'slugs', article.slug));
      } catch {}

      setActionSuccess(`"${article.title}" устгагдлаа.`);
      setTimeout(() => setActionSuccess(null), 4000);
      await fetchNews();
    } catch (err: any) {
      console.error('Error deleting news:', err);
      setActionError('Устгахад алдаа гарлаа: ' + err.message);
      try {
        handleFirestoreError(err, OperationType.DELETE, `news/${article.slug}`);
      } catch {}
    }
  };

  // 4. Create new draft directly
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim() || !newTitle.trim() || !newLead.trim() || !newBody.trim()) {
      alert('Шаардлагатай бүх талбарыг бөглөнө үү.');
      return;
    }

    setCreatingSubmitting(true);
    setActionError(null);

    const cleanSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const now = new Date().toISOString();

    const parsedSources = newSources
      .split('\n')
      .map((line) => {
        const parts = line.split(',');
        return {
          name: (parts[0] || 'Эх сурвалж').trim(),
          url: (parts[1] || 'https://google.com').trim()
        };
      })
      .filter((s) => s.name);

    const newItem: NewsItem = {
      slug: cleanSlug,
      status: 'draft',
      date: now.split('T')[0],
      category: newCategory.trim() || 'General',
      tags: [newCategory.trim() || 'News'],
      title: newTitle.trim(),
      lead: newLead.trim(),
      body_markdown: newBody.trim(),
      sources: parsedSources.length > 0 ? parsedSources : [{ name: 'Channel Mongolia', url: 'https://channelmongolia.mn' }],
      image: newImageUrl.trim() ? { url: newImageUrl.trim() } : undefined,
      seo: { meta_description: newLead.trim().substring(0, 160) },
      created_at: now,
      published_at: null
    };

    try {
      await setDoc(doc(db, 'news', cleanSlug), newItem);
      await setDoc(doc(db, 'slugs', cleanSlug), { slug: cleanSlug, created_at: now });

      setActionSuccess(`Ноорог мэдээ "${newTitle}" амжилттай үүсгэгдлээ!`);
      setTimeout(() => setActionSuccess(null), 4000);
      setIsCreatingNew(false);
      // Reset form
      setNewSlug('');
      setNewTitle('');
      setNewLead('');
      setNewBody('');
      setNewImageUrl('');
      await fetchNews();
    } catch (err: any) {
      console.error('Error creating news:', err);
      setActionError('Ноорог үүсгэхэд алдаа гарлаа: ' + err.message);
      try {
        handleFirestoreError(err, OperationType.CREATE, `news/${cleanSlug}`);
      } catch {}
    } finally {
      setCreatingSubmitting(false);
    }
  };

  // --- RENDER: Loading Auth ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm">
          <RefreshCw size={20} className="animate-spin text-purple-400" />
          <span>Систем шалгаж байна...</span>
        </div>
      </div>
    );
  }

  // --- RENDER: Not logged in or unauthorized ---
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Newspaper size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Админ удирдлагын хэсэг
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Мэдээний системд зөвхөн эрх бүхий админ хаягаар нэвтрэн ноорог мэдээ хянах, нийтлэх, засах боломжтой.
            </p>
          </div>

          {/* Warning badge if non-admin signed in */}
          {currentUser && currentUser.email !== ADMIN_EMAIL && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-left">
              <div className="flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-300">Хандах эрхгүй байна</p>
                  <p className="text-slate-300">
                    Та одоогоор <span className="font-semibold text-white">{currentUser.email}</span> хаягаар нэвтэрсэн байна.
                  </p>
                  <p className="text-slate-400">
                    Зөвхөн <span className="font-semibold text-purple-300">{ADMIN_EMAIL}</span> имэйл хаягаар нэвтрэхийг зөвшөөрнө.
                  </p>
                </div>
              </div>
            </div>
          )}

          {popupBlocked && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/40 text-amber-200 rounded-2xl text-xs text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldAlert size={16} />
                <span>Pop-up цонхыг зөвшөөрнө үү (Allow popups)</span>
              </div>
              <p className="text-slate-300">
                Google нэвтрэх цонхыг таны хөтөч блоколсон байна.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Хөтчийн хаягийн мөр (URL bar)-ны баруун захад байрлах <b>Поп-ап хориглосон дүрсийг</b> дарна уу.</li>
                <li><b>"Always allow pop-ups and redirects from this site"</b> сонгоод <b>Done</b> дарна уу.</li>
                <li>Дараа нь доорх Google товчийг дахин дарж нэвтэрнэ үү.</li>
              </ul>
              <div className="pt-2 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={handleGoogleRedirectLogin}
                  className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl font-medium text-xs transition-colors text-center"
                >
                  Эсвэл: Хуудас шилжин нэвтрэх (Redirect)
                </button>
              </div>
            </div>
          )}

          {popupClosed && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/40 text-purple-200 rounded-2xl text-xs text-left space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <ShieldAlert size={16} />
                <span>Нэвтрэх цонх хаагдсан (auth/popup-closed-by-user)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Хэрэв Google цонх гарч ирээд шууд өөрөө хаагдсан бол хөтчийн хамгаалалт эсвэл күүки холболтыг тасалсан байж болно. Та дахин оролдох эсвэл <b>поп-апгүйгээр шууд шилжин нэвтэрч</b> болно.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleRedirectLogin}
                  className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-colors text-center shadow-md"
                >
                  Хуудас шилжин нэвтрэх (Redirect)
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs transition-colors text-center"
                >
                  Дахин товшиж үзэх
                </button>
              </div>
            </div>
          )}

          {authError && !popupBlocked && !popupClosed && (
            <div className="p-3 bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl text-xs text-left">
              {authError}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {!currentUser ? (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 font-bold rounded-xl text-sm shadow-md hover:bg-slate-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google эрхээр нэвтрэх</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleGoogleRedirectLogin}
                    className="text-[11px] text-slate-400 hover:text-purple-300 transition-colors underline underline-offset-2"
                  >
                    Поп-ап нээгдэхгүй бол: Хуудас шилжин нэвтрэх (Redirect)
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs hover:bg-slate-700 transition-colors"
              >
                <LogOut size={16} />
                <span>Гарах / Өөр хаягаар нэвтрэх</span>
              </button>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <Link to="/news" className="hover:text-slate-300">
                ← Нийтийн мэдээ рүү очих
              </Link>
              <span>Channel Mongolia</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter items
  const currentList = activeTab === 'drafts' ? drafts : published;
  const filteredList = currentList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                <Newspaper size={18} />
              </div>
              <span className="hidden sm:inline">Channel Mongolia</span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* API Health Indicator */}
            <div
              className={`hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
                apiHealth
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title="GET /api/news/health"
            >
              <Activity size={12} className={apiHealth ? 'animate-pulse' : ''} />
              <span>/api/news: {apiHealth ? 'Healthy' : 'Checking'}</span>
            </div>

            {/* Current Admin Email */}
            <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-300">{currentUser.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Гарах"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Toast Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span>Мэдээний удирдлага</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              POST /api/news-ээр үүссэн ноорог мэдээг хянах, засварлах, нэг товшилтоор нийтлэх.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchNews}
              disabled={loadingNews}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <RefreshCw size={14} className={loadingNews ? 'animate-spin' : ''} />
              <span>Шинэчлэх</span>
            </button>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
            >
              <Plus size={15} />
              <span>Шинэ ноорог үүсгэх</span>
            </button>

            <Link
              to="/news"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <span>Нийтийн хуудас</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Tab & Search Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText size={14} />
              <span>Ноорог мэдээ (Drafts)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40 text-slate-200">
                {drafts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'published'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle size={14} />
              <span>Нийтлэгдсэн (Published)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40 text-slate-200">
                {published.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Гарчиг, категори хайх..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Content List: Drafts or Published */}
        {loadingNews ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-purple-500 mx-auto" />
            <p className="text-xs text-slate-400">Мэдээ ачааллаж байна...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
            <Newspaper size={40} className="mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">
              {activeTab === 'drafts' ? 'Ноорог мэдээ одоогоор байхгүй байна' : 'Нийтлэгдсэн мэдээ байхгүй байна'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeTab === 'drafts'
                ? 'Сервэрийн POST /api/news эндпойнт руу мэдээ илгээх эсвэл "Шинэ ноорог үүсгэх" товчоор шинэ нийтлэл оруулах боломжтой.'
                : 'Ноорог таб руу шилжиж "Publish" товчийг дарж мэдээг олон нийтэд нийтлэнэ үү.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Гарчиг (Title)</th>
                    <th className="py-3.5 px-4 w-32">Огноо (Date)</th>
                    <th className="py-3.5 px-4 w-32">Ангилал (Category)</th>
                    <th className="py-3.5 px-4 w-28">Төлөв (Status)</th>
                    <th className="py-3.5 px-4 text-right w-64">Үйлдэл (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredList.map((article) => {
                    const displayDate = article.date || (article.created_at ? article.created_at.split('T')[0] : '-');

                    return (
                      <tr
                        key={article.slug}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setPreviewArticle(article)}
                      >
                        {/* Title */}
                        <td className="py-4 px-4 font-semibold text-white">
                          <div className="space-y-1">
                            <span className="group-hover:text-purple-300 transition-colors line-clamp-2 text-sm">
                              {article.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
                              <span className="font-mono text-purple-400/80">/{article.slug}</span>
                              {article.sources && article.sources.length > 0 && (
                                <span>• {article.sources.length} эх сурвалж</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-purple-400" />
                            <span>{displayDate}</span>
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {article.category || 'General'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              article.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {article.status === 'published' ? 'Нийтлэгдсэн' : 'Ноорог (Draft)'}
                          </span>
                        </td>

                        {/* Actions (Publish, Edit, Delete, Preview) */}
                        <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Button */}
                            <button
                              onClick={() => setPreviewArticle(article)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                              title="Урьдчилан үзэх"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Publish Button (Only for drafts, or already published indicator) */}
                            {article.status === 'draft' ? (
                              <button
                                onClick={() => handlePublish(article)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition-all hover:scale-105"
                                title="Нийтлэх"
                              >
                                <CheckCircle size={13} />
                                <span>Publish</span>
                              </button>
                            ) : (
                              <Link
                                to={`/news/${article.slug}`}
                                target="_blank"
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-slate-800 transition-colors"
                                title="Нийтлэгдсэн хуудас үзэх"
                              >
                                <ExternalLink size={15} />
                              </Link>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(article)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold rounded-lg text-xs border border-indigo-500/30 transition-colors"
                              title="Засварлах"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(article)}
                              className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Устгах"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API Ingestion Info helper for developer / webhook */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Автомат нийтлэх API эндпойнт (Ingestion API):</span>
            <span className="font-mono text-purple-400">POST /api/news</span>
          </div>
          <p className="leading-relaxed">
            Та эсвэл таны AI Crawler систем <code className="text-purple-300">Authorization: Bearer &lt;NEWS_API_KEY&gt;</code>{' '}
            толгойтойгоор мэдээ оруулахад шууд энэ админ самбарт <b>draft</b> төлөвтэй орж ирэх ба эндээс шалгаад{' '}
            <b>Publish</b> товчоор нийтэлнэ.
          </p>
        </div>
      </main>

      {/* --- PREVIEW MODAL --- */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                  {previewArticle.category || 'General'}
                </span>
                <span className="text-xs text-slate-400 font-mono">/{previewArticle.slug}</span>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
              <h2 className="text-2xl font-black text-white">{previewArticle.title}</h2>

              {previewArticle.lead && (
                <div className="p-4 rounded-xl bg-slate-800/60 border-l-4 border-purple-500 italic text-sm text-slate-300">
                  {previewArticle.lead}
                </div>
              )}

              {previewArticle.image?.url && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72">
                  <img
                    src={previewArticle.image.url}
                    alt={previewArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Body Markdown */}
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {DOMPurify.sanitize(previewArticle.body_markdown || '')}
                </ReactMarkdown>
              </div>

              {/* Sources */}
              {previewArticle.sources && previewArticle.sources.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Эх сурвалжууд:</h4>
                  <ul className="space-y-1">
                    {previewArticle.sources.map((src, i) => (
                      <li key={i} className="text-xs">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <span>{src.name}</span>
                          <ExternalLink size={11} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Төлөв: <b className="text-white">{previewArticle.status}</b>
              </span>
              <div className="flex items-center gap-2">
                {previewArticle.status === 'draft' && (
                  <button
                    onClick={() => {
                      handlePublish(previewArticle);
                      setPreviewArticle(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    <span>Publish article</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    openEditModal(previewArticle);
                    setPreviewArticle(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (title, lead, body, image url) --- */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Мэдээ засварлах</h3>
                <p className="text-xs text-slate-400 font-mono">/{editingArticle.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Гарчиг (Title)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ангилал (Category)</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Lead */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Хураангуй / Удиртгал (Lead)</label>
                <textarea
                  value={editLead}
                  onChange={(e) => setEditLead(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Зургийн линк (Image URL)</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Body Markdown */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Үндсэн агуулга (Body Markdown)</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={8}
                  required
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                {savingEdit ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                <span>Хадгалах</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CREATE DRAFT MODAL --- */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDraft}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Шинэ ноорог мэдээ үүсгэх</h3>
                <p className="text-xs text-slate-400">Үүссэн мэдээ шууд "draft" төлөвтэй хадгалагдана.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug (Дахин давтагдашгүй ID)</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="tsahim-zasag-2026"
                    required
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ангилал (Category)</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Технологи"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Гарчиг (Title)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Мэдээний гарчиг"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Удиртгал / Lead</label>
                <textarea
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  placeholder="Товч хураангуй..."
                  rows={2}
                  required
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Зургийн линк (Image URL)</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Эх сурвалжууд (Мөр бүрт: Нэр, URL)</label>
                <textarea
                  value={newSources}
                  onChange={(e) => setNewSources(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Үндсэн бичвэр (Body Markdown)</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="# Гарчиг..."
                  rows={6}
                  required
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={creatingSubmitting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                {creatingSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>Ноорог үүсгэх</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
