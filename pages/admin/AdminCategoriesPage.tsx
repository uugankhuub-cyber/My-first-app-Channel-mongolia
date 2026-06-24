import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  FolderPlus, Edit2, Trash2, CheckCircle, AlertTriangle, 
  RefreshCw, X, Folder, Link as LinkIcon 
} from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export const AdminCategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Ангиллуудыг ачаалахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Name Input Change (Auto-slugify)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editId) {
      const clean = val
        .toLowerCase()
        .replace(/[^a-zA-Z0-9а-яА-ЯөӨүҮө\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      setSlug(clean);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setMessage({ type: 'error', text: 'Нэр болон Сорт холбоос байх шаардлагатай.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, slug })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editId ? 'Ангиллыг амжилттай шинэчиллээ.' : 'Шинэ ангилал амжилттай үүсгэлээ.' });
        setName('');
        setSlug('');
        setEditId(null);
        fetchCategories();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Хадгалахад алдаа гарлаа.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Edit mode
  const startEdit = (cat: CategoryItem) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setMessage(null);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setMessage(null);
  };

  // Delete Category
  const handleDelete = async (id: string) => {
    if (!window.confirm('Энэ ангиллыг устгах уу? (Нийтлэлүүд ангилалгүй болно)')) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ангиллыг амжилттай устгалаа.' });
        fetchCategories();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Устгах үйлдэл амжилтгүй боллоо.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Folder className="text-brand-purple" />
          <span>Ангиллын удирдлага</span>
        </h1>
        <p className="text-slate-400 text-sm">Нийтлэлүүдийг ангилж, зохион байгуулах үндсэн салбар хэсгүүдийг удирдах хуудас</p>
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
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-white font-bold text-sm">Бүртгэлтэй ангиллууд ({categories.length})</h3>
              <button 
                onClick={fetchCategories} 
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Шинэчлэх"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-xs mt-3">Ангиллуудыг уншиж байна...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Folder size={32} className="text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">Одоогоор ямар нэг ангилал бүртгэгдээгүй байна.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="p-4 bg-[#0B0F19]/50 border border-white/5 rounded-xl flex items-center justify-between hover:border-brand-purple/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <Folder size={14} className="text-brand-purple" />
                        <span>{cat.name}</span>
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono flex items-center gap-1">
                          <LinkIcon size={10} />
                          {cat.slug}
                        </span>
                        <span>•</span>
                        <span>{cat.articleCount} нийтлэл</span>
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(cat)}
                        className="p-1.5 hover:bg-brand-purple/15 text-slate-400 hover:text-brand-purple rounded-lg transition-colors"
                        title="Засах"
                      >
                        <Edit2 size={14} />
                      </button>
                      
                      {user?.role === 'ADMIN' && (
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          disabled={actionLoading}
                          className="p-1.5 hover:bg-red-500/15 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Устгах"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories form (Right 1 col) */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3 flex items-center gap-2">
            <FolderPlus size={16} className="text-brand-purple" />
            <span>{editId ? 'Ангилал засварлах' : 'Шинэ ангилал нэмэх'}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold">Ангиллын нэр</label>
              <input 
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                placeholder="Ж: Шинжлэх ухаан"
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
              />
            </div>

            {/* Slug Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold">Сорт хаяг (Slug)</label>
              <input 
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="science"
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-brand text-white rounded-xl text-xs font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{editId ? 'Хадгалах' : 'Үүсгэх'}</span>
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2.5 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-xs font-bold border border-white/5 transition-colors"
                >
                  Цуцлах
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
