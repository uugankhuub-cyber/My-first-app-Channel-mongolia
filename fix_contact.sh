cat << 'INNER_EOF' > pages/ContactPage.tsx.patch
--- pages/ContactPage.tsx
+++ pages/ContactPage.tsx
@@ -1,5 +1,5 @@
-import React from 'react';
+import React, { useState } from 'react';
 import { Mail, Phone, MapPin, Send } from 'lucide-react';
 import { motion } from 'motion/react';
 import { useLanguage } from '../context/LanguageContext';
 import { Container } from '../components/Container';
@@ -21,6 +21,11 @@
 
 export const ContactPage: React.FC = () => {
   const { t } = useLanguage();
+  const [name, setName] = useState('');
+  const [email, setEmail] = useState('');
+  const [message, setMessage] = useState('');
+  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setStatus('loading');
+    try {
+      const res = await fetch('/api/contact', {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ name, email, message })
+      });
+      if (!res.ok) throw new Error('Failed');
+      setStatus('success');
+      setName('');
+      setEmail('');
+      setMessage('');
+    } catch (err) {
+      setStatus('error');
+    }
+  };
 
   return (
@@ -87,21 +102,28 @@
              <motion.div variants={itemVariants}>
                 <Card className="p-8">
-                   <form className="space-y-6">
+                   <form onSubmit={handleSubmit} className="space-y-6">
+                      {status === 'success' && (
+                         <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium">
+                            {t('contact_success') || 'Амжилттай илгээгдлээ. Бид тун удахгүй холбогдох болно!'}
+                         </div>
+                      )}
+                      {status === 'error' && (
+                         <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
+                            Алдаа гарлаа. Дахин оролдоно уу.
+                         </div>
+                      )}
                       <div>
                          <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_name')}</label>
-                         <input type="text" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
+                         <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_email')}</label>
-                         <input type="email" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
+                         <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-text-muted mb-2">{t('contact_message')}</label>
-                         <textarea rows={4} className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all"></textarea>
+                         <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all"></textarea>
                       </div>
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
-                        type="button" 
-                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all"
+                        type="submit"
+                        disabled={status === 'loading'}
+                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
                       >
INNER_EOF
patch pages/ContactPage.tsx < pages/ContactPage.tsx.patch
