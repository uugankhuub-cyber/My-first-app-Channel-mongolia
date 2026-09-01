import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Shield, Calendar, Mail, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-400">
        Нэвтрэх шаардлагатай.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-3xl shadow-xl overflow-hidden border border-border"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-brand"></div>

        {/* Content */}
        <div className="relative px-6 pb-8 md:px-12 md:pb-12">
          {/* Avatar overlay */}
          <div className="absolute -top-12 left-6 md:left-12">
            <div className="w-24 h-24 rounded-2xl bg-brand-purple flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-slate-900">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="pt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Хэрэглэгчийн Профайл</span>
                {user.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/10">
                    <Shield size={12} />
                    Admin
                  </span>
                )}
                {user.role === 'EDITOR' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/10">
                    <Shield size={12} />
                    Editor
                  </span>
                )}
                {user.role === 'USER' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/10">
                    Хэрэглэгч
                  </span>
                )}
              </h1>
              <p className="text-text-muted mt-1">Channel Mongolia системд амжилттай нэвтэрсэн</p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surfaceHighlight rounded-2xl border border-border space-y-4">
              <h2 className="text-lg font-bold text-text-main">Үндсэн мэдээлэл</h2>
              
              <div className="flex items-center gap-3 text-text-muted">
                <Mail size={18} className="text-brand-purple" />
                <div>
                  <div className="text-xs text-slate-400">Имэйл хаяг</div>
                  <div className="font-semibold">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-text-muted">
                <Shield size={18} className="text-brand-purple" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Хэрэглэгчийн эрх</div>
                  <div className="font-semibold">{user.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-text-muted">
                <Calendar size={18} className="text-brand-purple" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Бүртгүүлсэн огноо</div>
                  <div className="font-semibold">2026 он</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surfaceHighlight rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-main mb-4">Хэрэглэгчийн статистик</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-white/5">
                    <span className="text-text-muted text-sm">Уншсан нийтлэл</span>
                    <span className="font-bold text-brand-purple">12</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-white/5">
                    <span className="text-text-muted text-sm">Хадгалсан материал</span>
                    <span className="font-bold text-brand-purple">4</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-muted text-sm">Сэтгэгдэл бичсэн</span>
                    <span className="font-bold text-brand-purple">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
