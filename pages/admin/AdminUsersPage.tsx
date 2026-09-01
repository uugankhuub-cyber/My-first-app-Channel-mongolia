import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Users, UserPlus, Shield, Lock, Unlock, Trash2, CheckCircle, 
  AlertTriangle, RefreshCw, X, Mail, ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserItem {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Create User Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'USER'>('USER');
  const [showAddForm, setShowAddForm] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create User Submit Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Имэйл болон Нууц үг заавал байх ёстой.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Шинэ хэрэглэгч амжилттай бүртгэгдлээ.' });
        setEmail('');
        setPassword('');
        setRole('USER');
        setShowAddForm(false);
        fetchUsers();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Бүртгэл амжилтгүй боллоо.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle user account lock state
  const handleLockToggle = async (userId: string, currentlyLocked: boolean) => {
    if (userId === currentUser?.id) {
      setMessage({ type: 'error', text: 'Та өөрийн бүртгэлийг түгжих боломжгүй.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) return;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          role: targetUser.role,
          isLocked: !currentlyLocked 
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Хэрэглэгчийн төлөвийг амжилттай өөрчлөө.` });
        fetchUsers();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Үйлдэл амжилтгүй боллоо.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Change Role
  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'EDITOR' | 'USER') => {
    if (userId === currentUser?.id) {
      setMessage({ type: 'error', text: 'Та өөрийн эрхийг өөрчлөх боломжгүй.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) return;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          role: newRole,
          isLocked: !!(targetUser.lockedUntil && new Date(targetUser.lockedUntil) > new Date())
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Хэрэглэгчийн эрх өөрчлөгдлөө.` });
        fetchUsers();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Эрх өөрчлөхөд алдаа гарлаа.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setMessage({ type: 'error', text: 'Та өөрийн бүртгэлийг устгах боломжгүй.' });
      return;
    }

    if (!window.confirm('Энэ хэрэглэгчийг системээс бүрмөсөн устгах уу?')) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Хэрэглэгчийг устгалаа.' });
        fetchUsers();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight flex items-center gap-2">
            <Users className="text-brand-purple" />
            <span>Хэрэглэгчдийн эрхийн тохиргоо</span>
          </h1>
          <p className="text-text-muted text-sm">Хэрэглэгчийн эрх (Role-Based Access Control) тодорхойлох, түгжих, удирдах хэсэг</p>
        </div>
        
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-brand text-text-main rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all self-start"
          >
            {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
            {showAddForm ? 'Хаах' : 'Хэрэглэгч үүсгэх'}
          </button>
        )}
      </div>

      {/* Message feedback */}
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

      {/* Add User panel */}
      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surfaceHighlight border border-border rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-text-main font-bold text-sm flex items-center gap-2">
            <UserPlus size={16} className="text-brand-purple" />
            <span>Шинэ хамтрагч урих / Хэрэглэгч үүсгэх</span>
          </h3>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-text-main text-xs font-semibold">Имэйл хаяг</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <Mail size={14} />
                </span>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@channelmongolia.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-text-main text-xs font-semibold">Нууц үг</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <Lock size={14} />
                </span>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-text-main text-xs font-semibold">Системийн эрх (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-text-main text-sm outline-none focus:border-brand-purple/50 transition-colors h-[42px]"
              >
                <option value="USER">USER - Энгийн уншигч</option>
                <option value="EDITOR">EDITOR - Нийтлэлч редактор</option>
                <option value="ADMIN">ADMIN - Системийн админ</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/95 text-text-main text-xs font-bold rounded-xl transition-all h-[42px] flex items-center justify-center gap-1.5"
            >
              {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Бүртгэл үүсгэх
            </button>
          </form>
        </motion.div>
      )}

      {/* Users table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-muted text-sm">Хэрэглэгчдийг уншиж байна...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceHighlight border-b border-border text-text-muted text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Хэрэглэгч (Имэйл)</th>
                  <th className="p-4">Эрх (Role)</th>
                  <th className="p-4">Төлөв</th>
                  <th className="p-4">Бүртгүүлсэн огноо</th>
                  <th className="p-4 pr-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((item) => {
                  const isLocked = !!(item.lockedUntil && new Date(item.lockedUntil) > new Date());
                  const isMe = item.id === currentUser?.id;
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                      {/* Email */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-main font-bold text-sm">
                            {item.email.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-text-main block truncate max-w-[200px]">{item.email}</span>
                            {isMe && <span className="text-[9px] bg-brand-purple/20 text-brand-purple px-1.5 py-0.5 rounded-md font-bold mt-0.5 inline-block">Идэвхтэй таны бүртгэл</span>}
                          </div>
                        </div>
                      </td>

                      {/* Role selection dropdown */}
                      <td className="p-4">
                        {isMe ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-purple/20 text-brand-purple border border-brand-purple/10">
                            <Shield size={12} />
                            {item.role}
                          </span>
                        ) : (
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value as any)}
                            disabled={actionLoading || currentUser?.role !== 'ADMIN'}
                            className="bg-background border border-border rounded-lg text-text-main text-xs px-2.5 py-1.5 outline-none focus:border-brand-purple/50 transition-colors font-medium cursor-pointer"
                          >
                            <option value="USER">USER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>

                      {/* Status lock status */}
                      <td className="p-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/10">
                            <Lock size={12} />
                            Блоколсон
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/10">
                            <Unlock size={12} />
                            Нээлттэй
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs font-mono text-text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        {!isMe && currentUser?.role === 'ADMIN' && (
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                            {/* Lock/Unlock Toggle */}
                            <button
                              onClick={() => handleLockToggle(item.id, isLocked)}
                              disabled={actionLoading}
                              className={`p-1.5 rounded-lg transition-colors ${isLocked ? 'hover:bg-green-500/15 text-green-400' : 'hover:bg-amber-500/15 text-amber-400'}`}
                              title={isLocked ? 'Түгжээ тайлах' : 'Данс түгжих'}
                            >
                              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>
                            
                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              disabled={actionLoading}
                              className="p-1.5 hover:bg-red-500/15 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                              title="Устгах"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
