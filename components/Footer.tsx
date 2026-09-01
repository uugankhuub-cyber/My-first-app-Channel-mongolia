
import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Container } from './ui/Container';

const { Link } = ReactRouterDOM;

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-surface border-t border-border mt-16 relative overflow-hidden transition-colors duration-300">
      <Container className="relative z-10 pt-16 pb-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-16"
        >
          <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-gradient">Channel Mongolia</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              {t('footer_desc')}
            </p>
            <div className="flex space-x-3">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Youtube, label: 'Youtube' }
                ].map((social, idx) => (
                  <motion.a 
                    key={idx}
                    href="#" 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg bg-surfaceHighlight flex items-center justify-center text-text-muted hover:bg-brand-purple hover:text-white transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2 md:col-start-7">
            <h3 className="text-[1.15rem] font-[800] text-text-main mb-6">{t('links')}</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/bidnii-tukhai" className="hover:text-brand-purple transition-colors block">{t('nav_about')}</Link></li>
              <li><Link to="/holboo-barikh" className="hover:text-brand-purple transition-colors block">{t('contact')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-purple transition-colors block">{t('ad_space')}</Link></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <h3 className="text-[1.15rem] font-[800] text-text-main mb-6">{t('nav_categories')}</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/shinzhleh-uhaan" className="hover:text-brand-purple transition-colors block">Science</Link></li>
              <li><Link to="/video" className="hover:text-brand-purple transition-colors block">Video</Link></li>
              <li><Link to="/tuuh-gazarzui" className="hover:text-brand-purple transition-colors block">History</Link></li>
            </ul>
          </motion.div>
          
           <motion.div variants={itemVariants} className="md:col-span-2">
            <h3 className="text-[1.15rem] font-[800] text-text-main mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/nuuts-lalin-bodlogo" className="hover:text-text-main transition-colors block">{t('privacy')}</Link></li>
              <li><Link to="/uilchilgeenii-nukhtsul" className="hover:text-text-main transition-colors block">{t('terms')}</Link></li>
            </ul>
          </motion.div>

        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-text-muted opacity-60">{t('copyright')}</p>
          <p className="text-[10px] text-text-muted opacity-50 font-mono">v1.0.0</p>
        </motion.div>
      </Container>
    </footer>
  );
};
