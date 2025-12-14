
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Send, MapPin, Phone } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
       <h1 className="text-4xl font-extrabold text-text-main mb-10 text-center">{t('contact_title')}</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-8">
             <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg">
                <h3 className="text-xl font-bold text-text-main mb-6">Get in touch</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 text-text-muted">
                      <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple">
                         <Mail size={20} />
                      </div>
                      <span>info@channelmongolia.mn</span>
                   </div>
                   <div className="flex items-center gap-4 text-text-muted">
                      <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple">
                         <Phone size={20} />
                      </div>
                      <span>+976 8811-0000</span>
                   </div>
                   <div className="flex items-center gap-4 text-text-muted">
                      <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-brand-purple">
                         <MapPin size={20} />
                      </div>
                      <span>Ulaanbaatar, Mongolia</span>
                   </div>
                </div>
             </div>
             <p className="text-text-muted text-sm leading-relaxed">
                If you have any questions, suggestions, or partnership inquiries, please do not hesitate to contact us. We usually respond within 24 hours.
             </p>
          </div>

          {/* Form Side */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg">
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
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all">
                   <Send size={18} />
                   <span>{t('contact_send')}</span>
                </button>
             </form>
          </div>
       </div>
    </div>
  );
};
