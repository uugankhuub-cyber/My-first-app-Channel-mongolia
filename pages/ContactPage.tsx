import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate sending an email to a real endpoint
    try {
      // Fake network delay
      await new Promise(res => setTimeout(res, 1200));
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
    }
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
                   {language === 'en' ? 'If you have any questions, suggestions, or partnership inquiries, please do not hesitate to contact us. We usually respond within 24 hours.' : 'Та бүхэнд асуулт, санал хүсэлт, хамтран ажиллах санал байвал эргэлзэлгүй холбогдоорой. Бид 24 цагийн дотор хариулах болно.'}
                </motion.p>
             </motion.div>

             {/* Form Side */}
             <motion.div variants={itemVariants}>
                <Card className="p-8">
                   <form onSubmit={handleSubmit} className="space-y-6">
                      {status === 'success' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex gap-3 text-sm font-medium">
                          <CheckCircle size={20} />
                          {language === 'en' ? 'Message sent successfully! We will get back to you soon.' : 'Таны зурвас амжилттай илгээгдлээ. Бид тун удахгүй холбогдох болно!'}
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex gap-3 text-sm font-medium">
                          <AlertCircle size={20} />
                          {language === 'en' ? 'An error occurred. Please try again.' : 'Алдаа гарлаа. Дахин оролдоно уу.'}
                        </div>
                      )}
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_name')}</label>
                         <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_email')}</label>
                         <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_message')}</label>
                         <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all"></textarea>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-wait"
                      >
                         <Send size={18} />
                         <span>{status === 'loading' ? 'Түр хүлээнэ үү...' : t('contact_send')}</span>
                      </motion.button>
                   </form>
                </Card>
             </motion.div>
          </div>
       </motion.div>
    </Container>
  );
};
