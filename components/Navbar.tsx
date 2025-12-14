
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, User, Moon, Sun, ShieldCheck } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAdmin } from '../context/AdminContext';
import { CATEGORIES } from '../constants';
import { Container } from './ui/Container';

const { Link, NavLink, useNavigate } = ReactRouterDOM;

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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setIsOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
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
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/5 ${
        scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-background/95 backdrop-blur-sm'
      }`}
    >
      <div className="relative z-10">
        {/* ROW 1: Brand, Search, Utilities */}
        <Container>
          <div className="flex h-16 items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="font-bold text-xl md:text-2xl tracking-tight text-gradient transition-all duration-300 group-hover:opacity-90">
                Channel Mongolia
              </span>
            </Link>

            {/* Search Bar (Desktop) - QUIET UI */}
            <div className="hidden md:flex flex-1 max-w-sm mx-auto">
              <form onSubmit={handleSearch} className="w-full relative group">
                  <div className="relative flex items-center">
                    <Search 
                      size={16} 
                      className="absolute left-3 text-slate-400 pointer-events-none" 
                    />
                    <input 
                      type="text" 
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={t('search_placeholder')}
                      className="w-full h-10 pl-9 pr-9 text-sm rounded-lg
                      bg-slate-100/60 dark:bg-white/5 
                      border border-slate-200 dark:border-white/10
                      text-slate-700 dark:text-slate-200 
                      placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:bg-white dark:focus:bg-slate-900 
                      focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/20 
                      transition-all duration-200 ease-out"
                      aria-label="Search"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language */}
              <button 
                onClick={() => setLanguage(language === 'mn' ? 'en' : 'mn')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-surfaceHighlight transition-colors text-text-muted hover:text-text-main"
              >
                <span className={language === 'mn' ? 'text-brand-purple' : ''}>MN</span>
                <span className="opacity-30 mx-1">/</span>
                <span className={language === 'en' ? 'text-brand-purple' : ''}>EN</span>
              </button>

              {/* Theme Toggle (Desktop) */}
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
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  isAuthenticated 
                    ? 'bg-surfaceHighlight text-text-main border border-border hover:border-brand-purple/30' 
                    : 'bg-gradient-brand text-white shadow-sm hover:shadow-md'
                }`}
              >
                {isAuthenticated ? <ShieldCheck size={18} /> : <User size={18} />}
                <span>{isAuthenticated ? 'Admin' : t('login')}</span>
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

        {/* ROW 2: Navigation Categories */}
        <div className="border-t border-border/40 w-full overflow-hidden">
          <Container className="relative">
             {/* Mobile Fade Edges */}
             <div className="lg:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
             <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
             
             <div className="flex items-center h-12 md:h-14 gap-2 overflow-x-auto no-scrollbar px-1 py-2 mask-linear-fade">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) => `
                    flex-shrink-0 px-3 py-1.5 md:py-1 text-sm rounded-full whitespace-nowrap transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-brand-purple to-brand-orange text-white font-semibold shadow-sm' 
                      : 'text-text-muted font-medium hover:text-text-main hover:bg-surfaceHighlight'
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
          className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[150] w-[85vw] max-w-sm bg-surface shadow-2xl transform transition-transform duration-300 ease-in-out ${
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
            
            {/* Mobile Search - QUIET UI */}
            <form onSubmit={handleSearch} className="relative group">
               <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input 
                    type="text" 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full h-12 pl-10 pr-10 text-base rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-text-main placeholder-slate-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-purple/50 focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all duration-200"
                    aria-label="Search"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-text-main hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
               </div>
            </form>
            
            <nav className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    block px-4 py-3 rounded-xl text-base transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-brand-purple to-brand-orange text-white font-semibold shadow-md' 
                      : 'text-text-main font-medium hover:bg-surfaceHighlight'
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            
            <div className="border-t border-border pt-4 space-y-2">
               <Link to="/bidnii-tukhai" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-text-muted hover:text-text-main rounded-xl hover:bg-surfaceHighlight/30">{t('nav_about')}</Link>
               <Link to="/holboo-barikh" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-text-muted hover:text-text-main rounded-xl hover:bg-surfaceHighlight/30">{t('contact')}</Link>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-surfaceHighlight/50 space-y-3">
             {/* Mobile Theme & Lang Toggles */}
             <div className="flex items-center justify-between gap-2 mb-2">
                <button 
                  onClick={() => setLanguage(language === 'mn' ? 'en' : 'mn')}
                  className="flex-1 py-2 rounded-lg border border-border bg-surface text-text-muted text-xs font-bold hover:text-text-main transition-colors"
                >
                  {language === 'mn' ? 'EN хэл рүү шилжих' : 'Switch to Mongolian'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:text-brand-orange transition-colors"
                  aria-label={t('theme_dark')}
                >
                   {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
             </div>

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
