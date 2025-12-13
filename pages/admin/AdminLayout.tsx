import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Sparkles, MessageSquare, 
  Settings, LogOut, Menu, X, ShieldCheck, Image as ImageIcon, ScrollText, Palette, MonitorPlay
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, logout, login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Protect Admin Routes: Redirect to /admin if not authenticated on sub-routes
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // Simple Login Screen Component inside Layout
  if (!isAuthenticated) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      const secret = (import.meta as any).env?.VITE_ADMIN_SECRET || process.env.ADMIN_SECRET;
      if (!secret) {
        setError('Warning: ADMIN_SECRET env var is missing. Login disabled.');
        return;
      }

      if (login(password)) {
        navigate('/admin/dashboard');
      } else {
        setError('Нууц үг буруу байна!');
      }
    };

    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#1E293B] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow">
                <ShieldCheck className="text-white w-8 h-8" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Удирдлагын хэсэг</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Channel Mongolia Admin</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Нууц үг</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:border-brand-purple outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-gradient-brand text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md">
              Нэвтрэх
            </button>
            <div className="text-center mt-4">
               <button type="button" onClick={() => navigate('/')} className="text-slate-500 text-xs hover:text-slate-300">
                  Буцах
               </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Хянах самбар', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Контент', path: '/admin/content', icon: <FileText size={20} /> },
    { label: 'Зургийн сан', path: '/admin/images', icon: <ImageIcon size={20} /> },
    { label: 'Медиа солих', path: '/admin/media', icon: <MonitorPlay size={20} /> },
    { label: 'Гадаад төрх', path: '/admin/appearance', icon: <Palette size={20} /> },
    { label: 'AI Санал', path: '/admin/ai-suggestions', icon: <Sparkles size={20} /> },
    { label: 'Чатбот', path: '/admin/chat-settings', icon: <MessageSquare size={20} /> },
    { label: 'Систем лог', path: '/admin/logs', icon: <ScrollText size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E293B] border-r border-white/5 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <span className="font-bold text-xl text-gradient">CM Admin</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">
               <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
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
        <header className="lg:hidden h-16 bg-[#1E293B] border-b border-white/5 flex items-center px-4">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
              <Menu size={24} />
           </button>
           <span className="ml-4 font-bold text-white">Удирдлагын хэсэг</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};