
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Sparkles, MessageSquare, 
  Settings, LogOut, Menu, X, ShieldCheck, Image as ImageIcon, 
  ScrollText, Palette, MonitorPlay, Loader2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const { Outlet, NavLink, useNavigate, useLocation } = ReactRouterDOM;

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, logout, login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Login State
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Call Context login which calls API
    const success = await login(password);
    
    setLoading(false);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Нууц үг буруу байна!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // --- 1. LOGIN SCREEN (GUARD) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-border shadow-2xl animate-fade-in">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow">
                <ShieldCheck className="text-white w-8 h-8" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-text-main mb-2">Удирдлагын хэсэг</h2>
          <p className="text-text-muted text-center mb-8 text-sm">Channel Mongolia Admin</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Нууц үг</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple outline-none transition-colors"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Нэвтрэх'}
            </button>
            <div className="text-center mt-4">
               <button type="button" onClick={() => navigate('/')} className="text-text-muted text-xs hover:text-text-main">
                  Буцах
               </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED LAYOUT ---
  const navItems = [
    { label: 'Хянах самбар', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Контент', path: '/admin/content', icon: <FileText size={20} /> },
    { label: 'Зургийн сан', path: '/admin/images', icon: <ImageIcon size={20} /> },
    { label: 'Медиа солих', path: '/admin/media', icon: <MonitorPlay size={20} /> },
    { label: 'Гадаад төрх', path: '/admin/appearance', icon: <Palette size={20} /> },
    { label: 'AI Санал', path: '/admin/ai-suggestions', icon: <Sparkles size={20} /> },
    { label: 'Чатбот', path: '/admin/chat-settings', icon: <MessageSquare size={20} /> },
    { label: 'Систем лог', path: '/admin/logs', icon: <ScrollText size={20} /> },
    { label: 'Тохиргоо', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex text-text-main font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="font-bold text-xl text-gradient">CM Admin</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-text-muted">
               <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                      : 'text-text-muted hover:bg-surfaceHighlight hover:text-text-main'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              Гарах
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-surface border-b border-border flex items-center px-4">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-text-muted">
              <Menu size={24} />
           </button>
           <span className="ml-4 font-bold text-text-main">Удирдлагын хэсэг</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};
