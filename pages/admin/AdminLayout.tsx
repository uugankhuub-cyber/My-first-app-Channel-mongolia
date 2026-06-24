
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Sparkles, MessageSquare, 
  Settings, LogOut, Menu, X, ShieldCheck, Image as ImageIcon, 
  ScrollText, Palette, MonitorPlay, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const { Outlet, NavLink, useNavigate, useLocation } = ReactRouterDOM;

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- AUTHENTICATED LAYOUT ---
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

          <div className="px-6 py-4 border-b border-border bg-slate-900/20">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold">
                   {user?.email[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="text-xs font-bold text-white truncate">{user?.email}</span>
                   <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{user?.role}</span>
                </div>
             </div>
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

