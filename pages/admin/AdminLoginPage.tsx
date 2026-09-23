import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Loader2, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  loginWithGoogle, 
  loginWithGoogleRedirect, 
  checkRedirectResult, 
  ADMIN_EMAIL 
} from '../../lib/firebase';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as Admin/Editor, redirect to dashboard
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'EDITOR')) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Check redirect result on load
  useEffect(() => {
    checkRedirectResult()
      .then(async (firebaseUser) => {
        if (firebaseUser) {
          await handleSuccessfulFirebaseLogin(firebaseUser.email);
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
      });
  }, []);

  const handleSuccessfulFirebaseLogin = async (userEmail: string | null) => {
    if (!userEmail) {
      setError('Google хаягийн мэдээлэл олдсонгүй.');
      return;
    }

    if (userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError(`Хандах эрхгүй: Таны ${userEmail} хаяг админ биш байна. Зөвхөн ${ADMIN_EMAIL} зөвшөөрөгдөнө.`);
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Админ эрх баталгаажуулахад алдаа гарлаа');
      }

      const data = await res.json();
      login(data.user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setPopupBlocked(false);
    setGoogleLoading(true);

    try {
      const firebaseUser = await loginWithGoogle();
      await handleSuccessfulFirebaseLogin(firebaseUser.email);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        setPopupBlocked(true);
        setError('Хөтөч pop-up цонхыг хаасан байна. Та доорх "Redirect-ээр нэвтрэх" товчийг дарж нэвтэрнэ үү.');
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        setError('Нэвтрэх цонх автоматаар хаагдсан эсвэл цуцлагдсан байна.');
      } else {
        setError(msg || 'Google нэвтрэлт амжилтгүй боллоо');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setError('');
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      setError(err.message || 'Redirect нэвтрэлт эхлүүлэхэд алдаа гарлаа');
    }
  };

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
          <p className="text-text-muted mt-2 text-sm font-medium">Удирдлагын Нэгдсэн Систем</p>
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
              <div className="flex-1">
                <span>{error}</span>
                {popupBlocked && (
                  <button
                    type="button"
                    onClick={handleGoogleRedirectSignIn}
                    className="mt-2 block font-semibold text-brand-purple hover:underline"
                  >
                    Redirect ашиглан нэвтрэх &rarr;
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Firebase Google Auth Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-60 active:scale-98"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="animate-spin text-slate-900" size={18} />
                  <span>Google-ээр шалгаж байна...</span>
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-border w-full"></div>
            <span className="bg-[#131B2E] px-3 text-xs text-text-muted uppercase font-bold tracking-wider relative">эсвэл</span>
          </div>

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
              disabled={loading || googleLoading}
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
                  Нэвтрэх
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-8">
          &copy; 2026 Channel Mongolia. Удирдлагын хэсэг хамгаалагдсан.
        </p>
      </motion.div>
    </div>
  );
};
