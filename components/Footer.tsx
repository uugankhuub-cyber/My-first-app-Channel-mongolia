import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white dark:bg-[#020617] border-t border-gray-100 dark:border-white/5 pt-20 pb-10 mt-24 relative overflow-hidden">
      {/* Footer Ambient Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-brand-purple/5 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-bold text-xl tracking-wide text-gradient">Channel Mongolia</span>
            </div>
            <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-[#1877F2] hover:text-white transition-all duration-300"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-[#E4405F] hover:text-white transition-all duration-300"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"><Twitter size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-[#FF0000] hover:text-white transition-all duration-300"><Youtube size={18} /></a>
             </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">{t('links')}</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-500">
              <li><Link to="/bidnii-tukhai" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">{t('nav_about')}</Link></li>
              <li><Link to="/holboo-barikh" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">{t('contact')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">{t('ad_space')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">{t('nav_categories')}</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-500">
              <li><Link to="/shinzhleh-uhaan" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">Science</Link></li>
              <li><Link to="/video" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">Video</Link></li>
              <li><Link to="/tuuh-gazarzui" className="hover:text-brand-purple dark:hover:text-primary-400 transition-colors">History</Link></li>
            </ul>
          </div>
          
           <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-slate-500">
              <li><Link to="/nuuts-lalin-bodlogo" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link to="/uilchilgeenii-nukhtsul" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-100 dark:border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-400 dark:text-slate-600">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
