
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Container } from './ui/Container';

const { Link } = ReactRouterDOM;

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-surface border-t border-border mt-16 relative overflow-hidden transition-colors duration-300">
      {/* Footer Ambient Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-brand-purple/5 to-transparent pointer-events-none"></div>
      
      <Container className="relative z-10 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-lg tracking-wide text-gradient">Channel Mongolia</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer_desc')}
            </p>
            <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-muted hover:bg-[#1877F2] hover:text-white transition-all duration-300"><Facebook size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-muted hover:bg-[#E4405F] hover:text-white transition-all duration-300"><Instagram size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-muted hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"><Twitter size={16} /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-muted hover:bg-[#FF0000] hover:text-white transition-all duration-300"><Youtube size={16} /></a>
             </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h3 className="font-bold text-text-main mb-4 uppercase text-[11px] tracking-wider">{t('links')}</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/bidnii-tukhai" className="hover:text-brand-purple transition-colors">{t('nav_about')}</Link></li>
              <li><Link to="/holboo-barikh" className="hover:text-brand-purple transition-colors">{t('contact')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-purple transition-colors">{t('ad_space')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-text-main mb-4 uppercase text-[11px] tracking-wider">{t('nav_categories')}</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/shinzhleh-uhaan" className="hover:text-brand-purple transition-colors">Science</Link></li>
              <li><Link to="/video" className="hover:text-brand-purple transition-colors">Video</Link></li>
              <li><Link to="/tuuh-gazarzui" className="hover:text-brand-purple transition-colors">History</Link></li>
            </ul>
          </div>
          
           <div className="md:col-span-2">
            <h3 className="font-bold text-text-main mb-4 uppercase text-[11px] tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="/nuuts-lalin-bodlogo" className="hover:text-text-main transition-colors">{t('privacy')}</Link></li>
              <li><Link to="/uilchilgeenii-nukhtsul" className="hover:text-text-main transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-border pt-6 text-center md:text-left">
          <p className="text-xs text-text-muted opacity-60">{t('copyright')}</p>
        </div>
      </Container>
    </footer>
  );
};
