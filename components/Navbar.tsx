
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, User, Moon, Sun, ShieldCheck } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';
import { CATEGORIES } from '../constants';
import { Container } from './ui/Container';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAdmin();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setIsOpen(false);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const mainNavItems = [
    { label: t('nav_home'), path: '/', type: 'link' },
    ...CATEGORIES.map(cat => ({
       label: cat.label,
       path: `/${cat.slug}`, 
       type: 'category'
    })),
    { label: t('nav_video'), path: '/video', type: 'link' }
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="relative z-10">
        {/* TOP ROW: Brand, Search, Utilities */}
        <Container>
          <div className="flex h-16 items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="font-bold text-xl md:text-2xl tracking-tight text-gradient transition-all duration-300 group-hover:opacity-90">
                Channel Mongolia
              </span>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-auto">
              <form onSubmit={handleSearch} className="w-full relative group">
                  <input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-surfaceHighlight border border-transparent text-text-main placeholder-text-muted focus:bg-surface focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all duration-300"
                  />
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-brand-purple transition-colors" />
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language */}
              <button 
                onClick={() => setLanguage(language === 'mn' ? 'en' : 'mn')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-surfaceHighlight transition-colors text-text-muted hover:text-text-main"
              >
                <span className={language === 'mn' ? 'text-brand-purple' : ''}>MN</span>
                <span className="opacity-30 mx-1">/</span>
                <span className={language === 'en' ? 'text-brand-purple' : ''}>EN</span>
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-text-muted hover:bg-surfaceHighlight hover:text-brand-orange transition-colors"
                aria-label={theme === 'dark' ? t('theme_light') : t('theme_dark')}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Admin */}
              <button 
                onClick={handleAdminClick}
                className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  isAuthenticated 
                    ? 'bg-surfaceHighlight text-text-main border border-border hover:border-brand-purple/30' 
                    : 'bg-gradient-brand text-white shadow-glow hover:shadow-lg'
                }`}
              >
                {isAuthenticated ? <ShieldCheck size={18} /> : <User size={18} />}
                <span>{isAuthenticated ? 'Admin Panel' : t('login')}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 rounded-md text-text-main hover:bg-surfaceHighlight focus:outline-none"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </Container>

        {/* BOTTOM ROW: Navigation (Desktop) */}
        <div className="hidden lg:block border-t border-border/50">
          <Container>
            <div className="flex items-center h-12 gap-1 overflow-x-auto no-scrollbar">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) => `
                    px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200
                    ${isActive 
                      ? 'bg-brand-purple/10 text-brand-purple font-semibold' 
                      : 'text-text-muted hover:text-text-main hover:bg-surfaceHighlight'
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[101] w-[85vw] max-w-sm bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-bold text-xl text-gradient">Menu</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-surfaceHighlight"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surfaceHighlight border border-transparent text-text-main focus:border-brand-purple/50 focus:bg-surface outline-none"
              />
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </form>
            
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    block px-4 py-3 rounded-xl text-base font-medium transition-all
                    ${isActive 
                      ? 'bg-brand-purple/10 text-brand-purple border-l-4 border-brand-purple' 
                      : 'text-text-main hover:bg-surfaceHighlight'
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            
            <div className="border-t border-border pt-4 space-y-2">
               <Link to="/bidnii-tukhai" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-text-muted hover:text-text-main">{t('nav_about')}</Link>
               <Link to="/holboo-barikh" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-text-muted hover:text-text-main">{t('contact')}</Link>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-surfaceHighlight/50 space-y-3">
             <button 
                onClick={handleAdminClick} 
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 ${isAuthenticated ? 'bg-surface text-text-main border border-border' : 'bg-gradient-brand text-white'}`}
             >
                {isAuthenticated ? <ShieldCheck size={18} /> : <User size={18} />}
                <span>{isAuthenticated ? 'Admin Panel' : t('login')}</span>
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
