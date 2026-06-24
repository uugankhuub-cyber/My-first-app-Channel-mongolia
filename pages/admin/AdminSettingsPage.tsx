import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Settings, Save, CheckCircle, AlertTriangle, RefreshCw, X, 
  Globe, Mail, Phone, Facebook, ShieldCheck, Database 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingItem {
  id: string;
  key: string;
  value: string;
}

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Separate states for easy form bindings
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      if (res.ok) {
        const data: SettingItem[] = await res.json();
        setSettings(data);
        
        // Map to fields
        const getVal = (k: string) => data.find(s => s.key === k)?.value || '';
        setSiteName(getVal('siteName') || 'Channel Mongolia');
        setContactEmail(getVal('contactEmail'));
        setContactPhone(getVal('contactPhone'));
        setFbLink(getVal('fbLink'));
        setSeoTitle(getVal('seoTitle'));
        setSeoDesc(getVal('seoDesc'));
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Тохиргоог татахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') {
      setMessage({ type: 'error', text: 'Зөвхөн админ эрхтэй хэрэглэгч тохиргоог засах боломжтой.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = [
      { key: 'siteName', value: siteName },
      { key: 'contactEmail', value: contactEmail },
      { key: 'contactPhone', value: contactPhone },
      { key: 'fbLink', value: fbLink },
      { key: 'seoTitle', value: seoTitle },
      { key: 'seoDesc', value: seoDesc }
    ];

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Системийн тохиргоо амжилттай хадгалагдлаа.' });
        fetchSettings();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Хадгалахад алдаа гарлаа.');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="text-brand-purple" />
          <span>Системийн тохиргоо</span>
        </h1>
        <p className="text-slate-400 text-sm">Вэбсайтын мета мэдээлэл, хайлтын оновчлол болон холбоо барих мэдээллийг тохируулах хэсэг</p>
      </div>

      {/* Messages */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Системийн тохиргоог уншиж байна...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Settings */}
          <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3 flex items-center gap-2">
              <Globe size={16} className="text-brand-purple" />
              <span>Ерөнхий тохиргоо</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Name */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Вэбсайтын нэр (Site Name)</label>
                <input 
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
                />
              </div>

              {/* FB Link */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Фэйсбүүк хуудасны холбоос</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Facebook size={14} />
                  </span>
                  <input 
                    type="url"
                    value={fbLink}
                    onChange={(e) => setFbLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Холбоо барих Имэйл</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail size={14} />
                  </span>
                  <input 
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="info@channel.mn"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-semibold">Утасны дугаар</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Phone size={14} />
                  </span>
                  <input 
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+976 7000-1234"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO Default settings */}
          <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold text-sm border-b border-white/5 pb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-purple" />
              <span>Үндсэн SEO тохиргоо (Хайлтын систем оновчлол)</span>
            </h3>

            {/* Default SEO title */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold">Үндсэн SEO Гарчиг (SEO Title Template)</label>
              <input 
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Channel Mongolia - Шинжлэх ухаан, технологийн тавцан"
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
              />
            </div>

            {/* Default SEO Description */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold">Үндсэн SEO Тайлбар (SEO Description Template)</label>
              <textarea 
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Монгол хэл дээрх мэдлэг, мэдээллийн нэгдсэн систем..."
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Database stats and status panel */}
          <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-green-500/10 text-green-400 rounded-xl mt-0.5">
                <Database size={18} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Файлын сангийн синхрончлол</h4>
                <p className="text-slate-400 text-xs mt-0.5">MockDB болон Prisma системүүд амжилттай холбогдон ажиллаж байна.</p>
              </div>
            </div>

            {/* Submit button only for Admins */}
            {user?.role === 'ADMIN' ? (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-brand text-white rounded-xl text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all self-start md:self-auto"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Тохиргоог Хадгалах
              </button>
            ) : (
              <div className="text-[10px] text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
                Тохиргоог зөвхөн ADMIN эрхтэй удирдах боломжтой.
              </div>
            )}
          </div>

        </form>
      )}
    </div>
  );
};
