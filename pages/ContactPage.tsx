
import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, MapPin, Phone } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container className="py-20">
       <motion.div 
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         className="max-w-4xl mx-auto"
       >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-extrabold text-text-main mb-10 text-center"
          >
            {t('contact_title')}
          </motion.h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {/* Info Side */}
             <motion.div variants={itemVariants} className="space-y-8">
                <Card className="p-8">
                   <h3 className="text-xl font-bold text-text-main mb-6">Get in touch</h3>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-text-muted">
                         <motion.div 
                           whileHover={{ scale: 1.1, rotate: 5 }}
                           className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple"
                         >
                            <Mail size={20} />
                         </motion.div>
                         <span className="text-sm font-medium">info@channelmongolia.mn</span>
                      </div>
                      <div className="flex items-center gap-4 text-text-muted">
                         <motion.div 
                           whileHover={{ scale: 1.1, rotate: 5 }}
                           className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple"
                         >
                            <Phone size={20} />
                         </motion.div>
                         <span className="text-sm font-medium">+976 8811-0000</span>
                      </div>
                      <div className="flex items-center gap-4 text-text-muted">
                         <motion.div 
                           whileHover={{ scale: 1.1, rotate: 5 }}
                           className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple"
                         >
                            <MapPin size={20} />
                         </motion.div>
                         <span className="text-sm font-medium">Ulaanbaatar, Mongolia</span>
                      </div>
                   </div>
                </Card>
                <motion.p 
                  variants={itemVariants}
                  className="text-text-muted text-sm leading-relaxed"
                >
                   If you have any questions, suggestions, or partnership inquiries, please do not hesitate to contact us. We usually respond within 24 hours.
                </motion.p>
             </motion.div>

             {/* Form Side */}
             <motion.div variants={itemVariants}>
                <Card className="p-8">
                   <form className="space-y-6">
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_name')}</label>
                         <input type="text" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_email')}</label>
                         <input type="email" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_message')}</label>
                         <textarea rows={4} className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all"></textarea>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button" 
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all"
                      >
                         <Send size={18} />
                         <span>{t('contact_send')}</span>
                      </motion.button>
                   </form>
                </Card>
             </motion.div>
          </div>
       </motion.div>
    </Container>
  );
};
