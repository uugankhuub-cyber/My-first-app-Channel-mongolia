import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Нууц үг зөрүүтэй байна');
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.user) {
        login(data.user);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(data.user?.role === 'ADMIN' ? '/admin/dashboard' : '/');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-text-main mb-2">Бүртгэл амжилттай</h1>
          <p className="text-text-muted">Таны имэйл хаяг руу баталгаажуулах линк илгээлээ. Имэйлээ шалгана уу.</p>
          <div className="mt-8">
            <Link to="/login" className="text-brand-purple font-medium hover:underline">Нэвтрэх хэсэг рүү очих</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Бүртгүүлэх</h1>
          <p className="text-text-muted text-sm">Channel Mongolia гэр бүлд нэгдэх</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Имэйл хаяг</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surfaceHighlight border border-border rounded-xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-brand-purple transition-colors"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Нууц үг</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-surfaceHighlight border border-border rounded-xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-brand-purple transition-colors"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1 ml-1">Багадаа 8 тэмдэгт, том жижиг үсэг, тоо, тэмдэгт орох ёстой.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">Нууц үг давтах</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-surfaceHighlight border border-border rounded-xl py-3 pl-12 pr-4 text-text-main focus:outline-none focus:border-brand-purple transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-brand text-white font-bold py-3 rounded-xl shadow-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-text-muted text-sm">
            Аль хэдийн бүртгэлтэй юу? <Link to="/login" className="text-brand-purple hover:underline">Нэвтрэх</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
