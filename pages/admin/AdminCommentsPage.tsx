import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  MessageSquare, Check, Ban, Trash2, ShieldAlert, CheckCircle, 
  AlertTriangle, RefreshCw, X, FileText, User 
} from 'lucide-react';
import { motion } from 'motion/react';

interface CommentItem {
  id: string;
  articleId: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  createdAt: string;
}

export const AdminCommentsPage: React.FC = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Сэтгэгдлүүдийг ачаалахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Handle Comment Status Update (Approve / Reject / Spam)
  const handleStatusUpdate = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM') => {
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/comments/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Сэтгэгдлийн төлөв шинэчлэгдлээ.' });
        fetchComments();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Төлөв өөрчлөхөд алдаа гарлаа.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Comment
  const handleDelete = async (id: string) => {
    if (!window.confirm('Энэ сэтгэгдлийг бүрмөсөн устгах уу?')) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Сэтгэгдэл амжилттай устлаа.' });
        fetchComments();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Устгах үйлдэл амжилтгүй боллоо.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredComments = comments.filter(c => 
    statusFilter === '' ? true : c.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
          <MessageSquare className="text-brand-purple" />
          <span>Сэтгэгдлийн хяналт</span>
        </h1>
        <p className="text-text-muted text-sm">Вэбсайт дахь уншигчдын сэтгэгдлийг зөвшөөрөх, спамаас хамгаалах хяналтын хэсэг</p>
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

      {/* Filter panel */}
      <div className="bg-surfaceHighlight border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-text-muted text-xs font-semibold">Шүүх:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-text-main text-xs outline-none focus:border-brand-purple/50 transition-colors cursor-pointer"
          >
            <option value="">Бүх сэтгэгдэл</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="APPROVED">Зөвшөөрсөн</option>
            <option value="REJECTED">Татгалзсан</option>
            <option value="SPAM">СПАМ</option>
          </select>
        </div>

        <button 
          onClick={fetchComments}
          className="p-2.5 bg-surfaceHighlight hover:bg-white/10 text-text-muted hover:text-text-main rounded-xl border border-border transition-colors self-end sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Listing List */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-muted text-sm">Сэтгэгдлүүдийг ачаалж байна...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare size={44} className="text-slate-600 mx-auto" />
            <h3 className="text-text-main font-bold text-md">Сэтгэгдэл олдсонгүй</h3>
            <p className="text-text-muted text-xs">Энэ шүүлтүүрт тохирох сэтгэгдэл одоогоор алга байна.</p>
          </div>
        ) : (
          filteredComments.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row gap-4 items-start hover:bg-white/[0.01] transition-all">
              
              {/* Left Author badge */}
              <div className="flex items-center gap-2.5 md:w-56 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-muted text-xs">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-main truncate" title={item.authorName}>{item.authorName}</h4>
                  <p className="text-[10px] text-text-muted font-mono truncate" title={item.authorEmail}>{item.authorEmail}</p>
                </div>
              </div>

              {/* Center Content block */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                  <span className="font-semibold flex items-center gap-1">
                    <FileText size={10} />
                    {item.articleTitle}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  
                  {/* Status Badge */}
                  {item.status === 'PENDING' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/5 font-bold">Шалгаж буй</span>
                  )}
                  {item.status === 'APPROVED' && (
                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/5 font-bold">Зөвшөөрсөн</span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/5 font-bold">Татгалзсан</span>
                  )}
                  {item.status === 'SPAM' && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/5 font-bold">СПАМ</span>
                  )}
                </div>

                <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-1.5 md:self-center">
                {item.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                    disabled={actionLoading === item.id}
                    className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                    title="Зөвшөөрөх"
                  >
                    <Check size={14} />
                  </button>
                )}

                {item.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                    disabled={actionLoading === item.id}
                    className="p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-text-muted rounded-lg transition-colors"
                    title="Татгалзах"
                  >
                    <Ban size={14} />
                  </button>
                )}

                {item.status !== 'SPAM' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'SPAM')}
                    disabled={actionLoading === item.id}
                    className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                    title="Спамаар тэмдэглэх"
                  >
                    <ShieldAlert size={14} />
                  </button>
                )}

                {/* Direct Delete */}
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoading === item.id}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Устгах"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
