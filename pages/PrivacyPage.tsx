import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Container } from '../components/ui/Container';
import { 
  ShieldCheck, Mail, Lock, EyeOff, Newspaper, Server, 
  FileText, CheckCircle2, Globe, ArrowLeft
} from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

export const PrivacyPage: React.FC = () => {
  const { language: siteLanguage } = useLanguage();
  // Allow user to toggle language directly on the privacy policy page or default to site language
  const [selectedLang, setSelectedLang] = useState<'mn' | 'en'>(siteLanguage === 'en' ? 'en' : 'mn');

  const isMn = selectedLang === 'mn';

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-12 md:py-20 bg-background min-h-[80vh]">
      <Container className="max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* Breadcrumb */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-purple transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{isMn ? 'Нүүр хуудас руу буцах' : 'Back to Home'}</span>
            </Link>

            {/* Language Switcher */}
            <div className="inline-flex items-center bg-surface border border-border p-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedLang('mn')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMn 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <span>Монгол</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isMn 
                    ? 'bg-brand-purple text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <span>English</span>
              </button>
            </div>
          </motion.div>

          {/* Header Banner */}
          <motion.div variants={itemVariants} className="space-y-4 text-center md:text-left border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold mb-2">
              <ShieldCheck size={16} />
              <span>{isMn ? 'Нууцлалын бодлого' : 'Privacy Policy'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-text-main tracking-tight leading-tight">
              {isMn ? 'Нууцлалын Бодлого' : 'Privacy Policy'}
            </h1>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              {isMn 
                ? 'Channel Mongolia цахим мэдээ, мэдлэгийн платформ нь уншигч, хэрэглэгчдийнхээ хувийн мэдээллийн аюулгүй байдлыг чандлан хамгаалдаг.'
                : 'Channel Mongolia digital news & knowledge platform is strictly committed to protecting the privacy and security of your personal data.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-text-muted">
              <span>{isMn ? 'Сүүлд шинэчилсэн:' : 'Last updated:'} 2026-03</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Channel Mongolia Media Group</span>
            </div>
          </motion.div>

          {/* Key Promises Badges */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-brand-purple flex items-center justify-center font-bold">
                <Newspaper size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-main">
                {isMn ? 'Бид мэдээ, танин мэдэхүй нийтэлдэг' : 'We Publish News & Knowledge'}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {isMn
                  ? 'Бид олон нийтэд зориулсан мэдээ, нийтлэл, видео, танин мэдэхүйн контент бэлтгэн хүргэдэг.'
                  : 'We publish news, educational articles, videos, and scientific facts for the public.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-green-500/20 shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
                <EyeOff size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-main flex items-center gap-1.5">
                <span>{isMn ? 'Мэдээлэл хэзээ ч худалдахгүй' : 'We Do NOT Sell Personal Data'}</span>
                <CheckCircle2 size={15} className="text-green-500" />
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {isMn
                  ? 'Хэрэглэгчийн хувийн мэдээллийг ямар ч тохиолдолд гуравдагч этгээдэд худалдахгүй, түрээслэхгүй.'
                  : 'We never sell, rent, or trade your personal information to third parties under any circumstances.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Mail size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-main">
                {isMn ? 'Шууд холбогдох' : 'Direct Contact'}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                <a href="mailto:uugankhuub@gmail.com" className="text-brand-purple font-mono font-semibold hover:underline">
                  uugankhuub@gmail.com
                </a>
                <span className="block mt-1">
                  {isMn ? 'Асуулт, хүсэлтийг шуурхай шийдвэрлэнэ.' : 'Prompt response to all privacy inquiries.'}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Full Policy Body */}
          <motion.div variants={itemVariants} className="bg-surface border border-border rounded-3xl p-6 md:p-10 space-y-8 text-text-main leading-relaxed shadow-soft">
            {isMn ? (
              /* Mongolian Content */
              <div className="space-y-8 text-sm md:text-base">
                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">1</span>
                    <span>Ерөнхий мэдээлэл ба үйл ажиллагааны чиглэл</span>
                  </h2>
                  <p className="text-text-muted">
                    Channel Mongolia (цаашид "бид", "платформ" гэх) нь шинжлэх ухаан, түүх, газарзүй, урлаг, спорт, дэлхий дахины сонин содон мэдээллийг Монгол болон Англи хэлээр бэлтгэн хүргэдэг цахим мэдээ, танин мэдэхүйн платформ юм. Бид олон нийтэд үнэн бодитой, чанартай мэдээлэл хүргэхийг эрхэм зорилгоо болгодог.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">2</span>
                    <span>Хувийн мэдээллийг худалдахгүй байх хатуу зарчим</span>
                  </h2>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-text-main space-y-2">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Бид таны хувийн мэдээллийг хэзээ ч бусдад худалдахгүй, арилжааны зорилгоор түрээслэхгүй.
                    </p>
                    <p className="text-xs md:text-sm text-text-muted">
                      Таны имэйл хаяг, нэвтрэх мэдээлэл, сэтгэгдлийн түүх зэрэг нь зөвхөн сайтад нэвтрэх, сэтгэгдэл үлдээх болон хэрэглэгчийн тохиргоог хадгалахад ашиглагдана.
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">3</span>
                    <span>Бид ямар мэдээлэл цуглуулдаг вэ?</span>
                  </h2>
                  <ul className="space-y-2.5 text-text-muted list-disc pl-5">
                    <li>
                      <strong className="text-text-main">Сайн дурын бүртгэлийн мэдээлэл:</strong> Хэрэв та манай платформд бүртгүүлэх эсвэл Google эрхээр нэвтэрвэл таны имэйл хаяг, нэр хадгалагдана.
                    </li>
                    <li>
                      <strong className="text-text-main">Нийтлэгдсэн сэтгэгдэл:</strong> Нийтлэлд үлдээсэн сэтгэгдэл, үнэлгээ.
                    </li>
                    <li>
                      <strong className="text-text-main">Техникийн лог ба күүки:</strong> Хөтчийн төрөл, дэлгэцийн горим (Dark/Light горимын сонголт), сайтын ачаалал, хандалтын тоо зэрэг хувийн бус статистик мэдээлэл.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">4</span>
                    <span>Гуравдагч талын үйлчилгээ ба нийгмийн сүлжээ</span>
                  </h2>
                  <p className="text-text-muted">
                    Манай сайт нь дараах итгэмжлэгдсэн үйлчилгээнүүдтэй хамтран ажилладаг:
                  </p>
                  <ul className="space-y-2 text-text-muted list-disc pl-5">
                    <li><strong className="text-text-main">YouTube:</strong> Бид албан ёсны YouTube сувгийнхаа видеог сайт дотроо шууд тоглуулах зорилгоор YouTube тоглуулагч ашигладаг.</li>
                    <li><strong className="text-text-main">Facebook:</strong> Нийтлэгдсэн мэдээ мэдээллийг Channel Mongolia албан ёсны Facebook хуудсанд автоматаар хуваалцахад албан ёсны Graph API ашиглагддаг.</li>
                    <li><strong className="text-text-main">Firebase (Google Cloud):</strong> Мэдээллийн сан болон хэрэглэгчийн аюулгүй нэвтрэлтийг найдвартай хамгаалдаг.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">5</span>
                    <span>Холбоо барих мэдээлэл</span>
                  </h2>
                  <p className="text-text-muted">
                    Хувийн мэдээлэл хамгаалалт, нууцлалын бодлоготой холбоотой санал, хүсэлт, өөрийн мэдээллийг устгуулах хүсэлтээ доорх хаягаар бидэнд илгээнэ үү:
                  </p>
                  <div className="p-4 rounded-xl bg-surfaceHighlight border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="text-brand-purple" size={20} />
                      <div>
                        <span className="text-xs text-text-muted block">Албан ёсны холбоо барих имэйл:</span>
                        <a href="mailto:uugankhuub@gmail.com" className="font-mono font-bold text-brand-purple text-base hover:underline">
                          uugankhuub@gmail.com
                        </a>
                      </div>
                    </div>
                    <a
                      href="mailto:uugankhuub@gmail.com"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition-colors shadow-xs"
                    >
                      <Mail size={14} />
                      <span>Имэйл илгээх</span>
                    </a>
                  </div>
                </section>
              </div>
            ) : (
              /* English Content */
              <div className="space-y-8 text-sm md:text-base">
                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">1</span>
                    <span>Overview & Mission</span>
                  </h2>
                  <p className="text-text-muted">
                    Channel Mongolia ("we", "our", or "the Platform") is a modern digital knowledge and news media publication sharing verified news, scientific breakthroughs, historical discoveries, geography, arts, and curated facts in Mongolian and English.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">2</span>
                    <span>We Do NOT Sell Personal Data</span>
                  </h2>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-text-main space-y-2">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      We do not sell, rent, monetize, or disclose your personal information to data brokers or third parties.
                    </p>
                    <p className="text-xs md:text-sm text-text-muted">
                      Any account details or contact information provided voluntarily are used strictly to provide access, post comments, or customize your user experience on our site.
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">3</span>
                    <span>Information We Collect</span>
                  </h2>
                  <ul className="space-y-2.5 text-text-muted list-disc pl-5">
                    <li>
                      <strong className="text-text-main">Voluntary Account Information:</strong> If you register or authenticate via Google, we collect your name and email address to maintain your session.
                    </li>
                    <li>
                      <strong className="text-text-main">User Contributions:</strong> Comments or inquiries submitted through contact forms.
                    </li>
                    <li>
                      <strong className="text-text-main">Technical Logs & Local Storage:</strong> Client preferences (such as dark/light mode and language choice) stored securely in your browser.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">4</span>
                    <span>Third-Party Integrations</span>
                  </h2>
                  <p className="text-text-muted">
                    We integrate with trusted providers solely to power editorial and media playback:
                  </p>
                  <ul className="space-y-2 text-text-muted list-disc pl-5">
                    <li><strong className="text-text-main">YouTube:</strong> Embedded video playback for Channel Mongolia video productions without leaving the site.</li>
                    <li><strong className="text-text-main">Facebook Graph API:</strong> For automatically syndicating published articles to our official Facebook Page.</li>
                    <li><strong className="text-text-main">Google Cloud / Firebase:</strong> Secure database storage and hosting infrastructure.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-surfaceHighlight text-brand-purple flex items-center justify-center text-xs font-black">5</span>
                    <span>Contact Information</span>
                  </h2>
                  <p className="text-text-muted">
                    If you have questions, feedback, or wish to exercise your data rights (including data deletion requests), please contact us directly:
                  </p>
                  <div className="p-4 rounded-xl bg-surfaceHighlight border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="text-brand-purple" size={20} />
                      <div>
                        <span className="text-xs text-text-muted block">Direct Contact Email:</span>
                        <a href="mailto:uugankhuub@gmail.com" className="font-mono font-bold text-brand-purple text-base hover:underline">
                          uugankhuub@gmail.com
                        </a>
                      </div>
                    </div>
                    <a
                      href="mailto:uugankhuub@gmail.com"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition-colors shadow-xs"
                    >
                      <Mail size={14} />
                      <span>Send Email</span>
                    </a>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};
export default PrivacyPage;
