import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Hash, Plus, Edit2, Trash2, CheckCircle, AlertTriangle, 
  RefreshCw, X, Tag as TagIcon 
} from 'lucide-react';
import { motion } from 'motion/react';

interface TagItem {
  id: string;
  name: string;
  articleCount: number;
}

export const AdminTagsPage: React.FC = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Шошгонуудыг ачаалахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Шошгоны нэр оруулна уу.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const url = editId ? `/api/admin/tags/${editId}` : '/api/admin/tags';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editId ? 'Шошгыг шинэчиллээ.' : 'Шинэ шошго үүсгэлээ.' });
        setName('');
        setEditId(null);
        fetchTags();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Алдаа гарлаа.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Edit
  const startEdit = (tag: TagItem) => {
    setEditId(tag.id);
    setName(tag.name);
    setMessage(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setMessage(null);
  };

  // Delete Tag
  const handleDelete = async (id: string) => {
    if (!window.confirm('Энэ шошгыг системээс бүрмөсөн устгах уу?')) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Шошгыг устгалаа.' });
        fetchTags();
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
          <Hash className="text-brand-purple" />
          <span>Шошгоны удирдлага (Tags)</span>
        </h1>
        <p className="text-slate-400 text-sm">Нийтлэлүүдэд хавсаргаж, хайлтын оновчлолыг сайжруулах түлхүүр үгсийг удирдах хэсэг</p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tags List Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-white font-bold text-sm">Идэвхтэй шошгонууд ({tags.length})</h3>
              <button 
                onClick={fetchTags}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-xs mt-3">Шошгонуудыг уншиж байна...</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Hash size={32} className="text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">Одоогоор ямар нэг шошго үүсгэгдээгүй байна.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="pl-3 pr-2.5 py-2 bg-[#0B0F19]/60 border border-white/5 rounded-xl flex items-center gap-2 group hover:border-brand-purple/20 transition-all"
                  >
                    <span className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                      <span className="text-brand-purple">#</span>
                      {tag.name}
                    </span>
                    <span className="bg-white/5 text-[10px] px-1.5 py-0.5 rounded-md text-slate-500 font-bold group-hover:text-slate-300">
                      {tag.articleCount}
                    </span>
                    
                    <div className="flex items-center gap-0.5 border-l border-white/5 pl-1">
                      <button 
                        onClick={() => startEdit(tag)}
                        className="p-1 text-slate-500 hover:text-brand-purple rounded transition-colors"
                        title="Засах"
                      >
                        <Edit2 size={11} />
                      </button>
                      
                      {user?.role === 'ADMIN' && (
                        <button 
                          onClick={() => handleDelete(tag.id)}
                          disabled={actionLoading}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="Устгах"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Tag Form */}
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-5 h-fit space-y-4">
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3 flex items-center gap-2">
            <TagIcon size={16} className="text-brand-purple" />
            <span>{editId ? 'Шошго засварлах' : 'Шинэ шошго үүсгэх'}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold">Шошгоны нэр</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">#</span>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="AI"
                  className="w-full pl-7 pr-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-brand text-white rounded-xl text-xs font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {actionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{editId ? 'Хадгалах' : 'Нэмэх'}</span>
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
