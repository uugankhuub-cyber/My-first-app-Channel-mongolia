import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as Admin/Editor, redirect to dashboard
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'EDITOR')) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Нэвтрэхэд алдаа гарлаа');
      }

      if (!res.ok) throw new Error(data.error || data.message || 'Нэвтрэхэд алдаа гарлаа');

      if (data.user.role !== 'ADMIN' && data.user.role !== 'EDITOR') {
        throw new Error('Удирдлагын хэсэгт нэвтрэх эрхгүй хэрэглэгч байна!');
      }

      login(data.user);
      if (rememberMe) {
        localStorage.setItem('admin_remember_email', email);
      } else {
        localStorage.removeItem('admin_remember_email');
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Back to Home */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-text-muted hover:text-text-main flex items-center gap-2 text-sm bg-surfaceHighlight hover:bg-white/10 px-4 py-2 rounded-full border border-border transition-colors"
      >
        <ArrowLeft size={16} />
        Үндсэн сайт руу буцах
      </button>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-brand rounded-2xl shadow-lg shadow-brand-purple/25 border border-border mb-4">
            <Shield className="text-text-main" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Channel Mongolia</h1>
          <p className="text-text-muted mt-2 text-sm font-medium">Удирдлагын Системд Нэвтрэх</p>
        </div>

        {/* Card */}
        <div className="bg-[#131B2E]/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm"
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@channel.mn"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-background border border-border focus:border-brand-purple rounded-2xl text-text-main text-sm outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Нууц үг</label>
                <button 
                  type="button" 
                  onClick={() => alert('Нууц үг сэргээх хүсэлтийг системийн админд илгээнэ үү.')}
                  className="text-xs text-brand-purple hover:underline"
                >
                  Нууц үг мартсан?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-background border border-border focus:border-brand-purple rounded-2xl text-text-main text-sm outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-[#0B0F19] text-brand-purple focus:ring-brand-purple"
                />
                <span className="text-xs text-text-muted font-medium">Намайг сана</span>
              </label>
              <span className="text-xs text-text-muted">Аюулгүй холболт</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-brand text-text-main font-bold hover:shadow-lg hover:shadow-brand-purple/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Уншиж байна...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Аюулгүй Нэвтрэх
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-8">
          &copy; 2026 Channel Mongolia LLC. Удирдлагын хэсэг хамгаалагдсан.
        </p>
      </motion.div>
    </div>
  );
};
