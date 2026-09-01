import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  FileText, Plus, Search, Filter, Edit, Trash2, Eye, 
  CheckCircle, RefreshCw, X, AlertTriangle, Clock, Calendar, Check, Ban, Archive 
} from 'lucide-react';
import { motion } from 'motion/react';

const { Link } = ReactRouterDOM;

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: { id: string; name: string; slug: string } | null;
  thumbnailUrl?: string;
  publishedAt: string | null;
  createdAt: string;
  views: number;
}

export const AdminArticlesPage: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load articles & categories
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch articles
      const artRes = await fetch(`/api/articles?search=${search}&status=${statusFilter}&category=${categoryFilter}`);
      if (artRes.ok) {
        const data = await artRes.json();
        setArticles(data);
      }

      // Fetch categories
      const catRes = await fetch('/api/admin/categories', {
        credentials: 'include'
      });
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Мэдээлэл авахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, categoryFilter]);

  // Handle Article Action
  const handleStatusChange = async (id: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Нийтлэлийн төлөв амжилттай өөрчлөгдлөө.` });
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Алдаа гарлаа');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Энэ нийтлэлийг устгахдаа итгэлтэй байна уу?')) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Нийтлэл амжилттай устлаа.' });
        fetchData();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Устгах эрх байхгүй байна.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
            <FileText className="text-brand-purple" />
            <span>Нийтлэлийн удирдлага</span>
          </h1>
          <p className="text-text-muted text-sm">Вэбсайт дахь нийтлэлүүдийг засварлах, устгах, төлөв өөрчлөх хэсэг</p>
        </div>
        <Link 
          to="/admin/articles/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-brand text-text-main rounded-xl text-sm font-bold shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 hover:-translate-y-0.5 active:translate-y-0 transition-all self-start"
        >
          <Plus size={18} />
          Шинэ Нийтлэл Бичих
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-text-muted hover:text-text-main">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Search and Filters panel */}
      <div className="bg-surfaceHighlight backdrop-blur-md border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Нийтлэлийн гарчиг болон агуулгаар хайх..."
            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-text-muted hidden md:block" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
          >
            <option value="">Бүх төлөв</option>
            <option value="PUBLISHED">Нийтлэгдсэн</option>
            <option value="DRAFT">Ноорог</option>
            <option value="ARCHIVED">Архивласан</option>
          </select>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-3 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
        >
          <option value="">Бүх ангилал</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Reload button */}
        <button 
          onClick={fetchData}
          className="p-3 bg-surfaceHighlight hover:bg-white/10 text-text-muted hover:text-text-main rounded-xl border border-border transition-colors self-stretch md:self-auto flex items-center justify-center"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-muted text-sm">Нийтлэлүүдийг ачаалж байна...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText size={48} className="text-slate-600 mx-auto" />
            <h3 className="text-text-main font-bold text-lg">Нийтлэл олдсонгүй</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">Хайлтын илэрц олдсонгүй эсвэл системд одоогоор ямар нэг нийтлэл байхгүй байна.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceHighlight border-b border-border text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Гарчиг</th>
                  <th className="p-4">Ангилал</th>
                  <th className="p-4">Төлөв</th>
                  <th className="p-4">Хандсан тоо</th>
                  <th className="p-4">Огноо</th>
                  <th className="p-4 pr-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Title */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surfaceHighlight/80 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=100'} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-text-main truncate max-w-[280px]" title={item.title}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-text-muted font-mono select-all">/{item.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="text-sm text-text-main font-medium">
                        {item.category ? item.category.name : 'Ерөнхий'}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      {item.status === 'PUBLISHED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/10">
                          <CheckCircle size={12} />
                          Нийтлэгдсэн
                        </span>
                      )}
                      {item.status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10">
                          <Clock size={12} />
                          Ноорог
                        </span>
                      )}
                      {item.status === 'ARCHIVED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-text-muted border border-slate-500/10">
                          <Archive size={12} />
                          Архивласан
                        </span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="p-4 text-text-main text-sm font-mono">
                      {(item.views || 0).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-text-muted text-sm font-mono">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Огноогүй'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Publish/Unpublish toggle icon button */}
                        {item.status !== 'PUBLISHED' ? (
                          <button
                            onClick={() => handleStatusChange(item.id, 'PUBLISHED')}
                            disabled={actionLoading === item.id}
                            title="Нийтлэх"
                            className="p-1.5 hover:bg-green-500/10 text-text-muted hover:text-green-400 rounded-lg border border-transparent transition-all"
                          >
                            <Check size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item.id, 'DRAFT')}
                            disabled={actionLoading === item.id}
                            title="Ноороглох"
                            className="p-1.5 hover:bg-amber-500/10 text-text-muted hover:text-amber-400 rounded-lg border border-transparent transition-all"
                          >
                            <Ban size={16} />
                          </button>
                        )}

                        <Link
                          to={`/admin/articles/edit/${item.id}`}
                          title="Засах"
                          className="p-1.5 hover:bg-brand-purple/10 text-text-muted hover:text-brand-purple rounded-lg border border-transparent transition-all"
                        >
                          <Edit size={16} />
                        </Link>

                        {/* Delete action only for Admin */}
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading === item.id}
                            title="Устгах"
                            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg border border-transparent transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
