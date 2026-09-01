import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Simulate API call for forgot password
      await new Promise(res => setTimeout(res, 1000));
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <Container className="py-20 flex justify-center min-h-[calc(100vh-80px)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-purple mb-6 transition-colors">
          <ArrowLeft size={16} />
          <span>{language === 'en' ? 'Back to Login' : 'Нэвтрэх хэсэг рүү буцах'}</span>
        </Link>
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-text-main mb-2">
            {language === 'en' ? 'Forgot Password?' : 'Нууц үгээ мартсан уу?'}
          </h1>
          <p className="text-text-muted text-sm mb-6">
            {language === 'en' 
              ? 'Enter your email address and we will send you a link to reset your password.' 
              : 'Имэйл хаягаа оруулна уу. Бид нууц үг сэргээх холбоос илгээх болно.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'success' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex gap-3 text-sm font-medium">
                <CheckCircle size={20} className="shrink-0" />
                {language === 'en' 
                  ? 'Password reset link has been sent to your email.' 
                  : 'Нууц үг сэргээх холбоос таны имэйл хаяг руу илгээгдлээ.'}
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex gap-3 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0" />
                {language === 'en' ? 'An error occurred. Please try again.' : 'Алдаа гарлаа. Дахин оролдоно уу.'}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                {language === 'en' ? 'Email Address' : 'Имэйл хаяг'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-text-muted" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-text-main focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading'}
              type="submit" 
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              <span>{status === 'loading' ? (language === 'en' ? 'Sending...' : 'Илгээж байна...') : (language === 'en' ? 'Send Reset Link' : 'Холбоос Илгээх')}</span>
            </motion.button>
          </form>
        </Card>
      </motion.div>
    </Container>
  );
};
