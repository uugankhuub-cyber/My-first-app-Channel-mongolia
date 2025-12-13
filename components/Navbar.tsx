import React, { useState } from 'react';
import { Menu, X, Search, User, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../constants';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setIsOpen(false);
    }
  };

  // Main navigation items for desktop (Row 2)
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
    <nav className="sticky top-0 z-50 transition-all duration-300">
       
       {/* Background with blur and gradient - Wraps both rows */}
       <div className="absolute inset-0 bg-white/95 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shadow-lg transition-colors duration-300">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-orange/5 pointer-events-none"></div>
       </div>

       <div className="relative z-10">
          
          {/* TOP ROW: Brand, Search, Utilities */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-6 border-b border-gray-200 dark:border-white/5">
              
              {/* Left: Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <span className="font-bold text-xl md:text-2xl tracking-wide text-gradient transition-all duration-300 group-hover:drop-shadow-glow">
                  Channel Mongolia
                </span>
              </Link>

              {/* Center: Search Bar (Desktop) */}
              <div className="hidden md:flex flex-1 max-w-xl mx-auto">
                <form onSubmit={handleSearch} className="w-full relative group">
                    <input 
                      type="text" 
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={t('search_placeholder')}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:bg-white dark:focus:bg-[#0F172A] focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 outline-none transition-all duration-300 group-hover:border-gray-300 dark:group-hover:border-white/20"
                    />
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-brand-purple transition-colors" />
                </form>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-4">
                
                {/* Language Toggle */}
                <button 
                  onClick={() => setLanguage(language === 'mn' ? 'en' : 'mn')}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <span className={language === 'mn' ? 'text-brand-purple' : ''}>MN</span>
                  <span className="text-gray-300 dark:text-white/20">|</span>
                  <span className={language === 'en' ? 'text-brand-purple' : ''}>EN</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-orange transition-colors"
                  title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Login Button */}
                <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-gradient-brand text-white rounded-full text-sm font-semibold hover:opacity-90 shadow-md hover:shadow-glow transition-all hover:-translate-y-0.5">
                  <User size={18} />
                  <span>{t('login')}</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Navigation Categories (Desktop) */}
          <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex items-center h-16 gap-2 overflow-x-auto no-scrollbar mask-fade-right">
                {mainNavItems.map((item) => {
                   const active = isActive(item.path);

                   return (
                    <Link
                      key={item.label}
                      to={item.path}
                      data-active={active ? "true" : "false"}
                      className="px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-purple dark:hover:text-white active:bg-gray-200 dark:active:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-brand-purple data-[active=true]:to-brand-orange data-[active=true]:text-white data-[active=true]:shadow-md transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                   );
                })}
             </div>
          </div>
       </div>

      {/* Mobile Menu Drawer - Z-Index 100 to stay above GlobalInfoBar (Z-60) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white dark:bg-[#020617] flex flex-col animate-fade-in">
           {/* Header of Drawer */}
           <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B1120]">
              <span className="font-bold text-xl text-gradient">Channel Mongolia</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-base focus:border-brand-purple/50 focus:bg-white dark:focus:bg-[#0F172A]"
                />
                <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </form>
            
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                 const active = isActive(item.path);
                 return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      active
                        ? 'bg-gradient-brand text-white shadow-glow'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-purple dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                 );
              })}
            </div>
            
            <div className="border-t border-gray-200 dark:border-white/10 pt-4">
               <Link to="/bidnii-tukhai" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white">{t('nav_about')}</Link>
               <Link to="/holboo-barikh" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white">{t('contact')}</Link>
            </div>
          </div>

          {/* Footer of Drawer */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B1120] space-y-3">
             <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-brand text-white rounded-xl text-sm font-bold shadow-md">
                <User size={18} />
                <span>{t('login')}</span>
              </button>
              
              <div className="flex items-center justify-between px-2 pt-2">
                 <button onClick={() => setLanguage(language === 'mn' ? 'en' : 'mn')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white">
                    {language === 'mn' ? 'Монгол хэл' : 'English'}
                 </button>
                 <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-purple dark:hover:text-white">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? t('theme_light') : t('theme_dark')}</span>
                 </button>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
};