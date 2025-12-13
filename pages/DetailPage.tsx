import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_CONTENT } from '../constants';
import { ThumbsUp, Share2, Bookmark, Eye, Calendar, User, PlayCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { QuizCard } from '../components/QuizCard';
import { useUserPreferences } from '../context/UserPreferencesContext';

export const DetailPage: React.FC = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { trackView } = useUserPreferences();
  const isEn = language === 'en';
  
  const content = MOCK_CONTENT.find(c => c.id === id) || MOCK_CONTENT[0];
  
  const title = isEn ? content.title_en : content.title;
  const description = isEn ? content.description_en : content.description;
  const body = isEn ? content.contentBody_en : content.contentBody;
  const category = isEn ? content.category_en : content.category;
  const tags = isEn ? content.tags_en : content.tags;

  // Track the view when component mounts
  useEffect(() => {
     if(content.category) {
         trackView(content.category);
     }
  }, [content.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2">
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-6">
             <span className="hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">{t('nav_home')}</span>
             <span className="mx-2 text-gray-400 dark:text-slate-600">/</span>
             <span className="text-primary-600 dark:text-primary-400 font-medium dark:drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">{category}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
            {title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#151E32] rounded-full flex items-center justify-center border border-gray-200 dark:border-white/5">
                    <User size={20} className="text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{t('admin')}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                        <Calendar size={12} />
                        <span>{content.publishedDate}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-medium">
                <Eye size={16} />
                <span>{content.views.toLocaleString()} {t('views')}</span>
            </div>
          </div>

          {/* Media Player / Hero Image */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-10 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 group">
             <img src={content.thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-90 dark:opacity-80" />
             {content.isVideo && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-20 h-20 bg-white/30 dark:bg-[#151E32]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 dark:border-white/30 shadow-lg dark:shadow-glow">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2 drop-shadow-lg"></div>
                     </div>
                 </div>
             )}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-white dark:bg-[#151E32]">
                <div className="w-1/3 h-full bg-primary-500 shadow-sm dark:shadow-[0_0_10px_#3b82f6]"></div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 dark:hover:bg-primary-500 transition-all shadow-sm dark:shadow-glow hover:scale-105">
                <PlayCircle size={18} />
                <span>{t('watch')}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#151E32] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors hover:text-gray-900 dark:hover:text-white">
                <ThumbsUp size={18} />
                <span>{t('like')}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#151E32] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors hover:text-gray-900 dark:hover:text-white">
                <Share2 size={18} />
                <span className="hidden sm:inline">{t('share')}</span>
            </button>
             <button className="p-3 bg-white dark:bg-[#151E32] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 ml-auto transition-colors hover:text-gray-900 dark:hover:text-white">
                <Bookmark size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-slate-300">
             <p className="font-medium text-xl text-gray-900 dark:text-slate-100 mb-6 leading-relaxed border-l-4 border-primary-500 pl-4">{description}</p>
             <p className="mb-6 leading-relaxed">
                 {body || 'Content not available in this language.'}
             </p>
             
             {/* FEATURE 3: QUIZ */}
             {content.quiz && <QuizCard quiz={content.quiz} />}

             <p>
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
             </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
             {tags.map((tag, i) => (
                 <span key={i} className="px-4 py-1.5 bg-gray-50 dark:bg-[#151E32] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors cursor-pointer">#{tag}</span>
             ))}
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1">
             <Sidebar />
        </div>
      </div>
    </div>
  );
};
