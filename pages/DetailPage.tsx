import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { ThumbsUp, Share2, Bookmark, Eye, Calendar, User, PlayCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { QuizCard } from '../components/QuizCard';
import { useUserPreferences } from '../context/UserPreferencesContext';

export const DetailPage: React.FC = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { trackView } = useUserPreferences();
  const { content: allContent } = useContent();
  const isEn = language === 'en';
  
  const content = allContent.find(c => c.id === id);
  
  // Fallback if not found (or still loading)
  if (!content) {
      return <div className="p-20 text-center text-slate-500">Loading or not found...</div>;
  }
  
  const title = isEn ? content.title_en : content.title;
  const description = isEn ? content.description_en : content.description;
  // Prefer contentBody (HTML) if available, otherwise fallback
  const body = isEn ? content.contentBody_en : (content.contentBody || content.description);
  const category = isEn ? content.category_en : content.category;
  const tags = isEn ? content.tags_en : content.tags;

  useEffect(() => {
     if(content.category) {
         trackView(content.category);
     }
  }, [content.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2">
          
          <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-6">
             <span className="hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">{t('nav_home')}</span>
             <span className="mx-2 text-gray-400 dark:text-slate-600">/</span>
             <span className="text-primary-600 dark:text-primary-400 font-medium dark:drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">{category}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
            {title}
          </h1>

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

          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-10 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5 group">
             <img src={content.thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-90 dark:opacity-80" />
             {content.isVideo && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-20 h-20 bg-white/30 dark:bg-[#151E32]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 dark:border-white/30 shadow-lg dark:shadow-glow">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2 drop-shadow-lg"></div>
                     </div>
                 </div>
             )}
          </div>

          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-slate-300">
             {/* Description Intro */}
             <p className="font-medium text-xl text-gray-900 dark:text-slate-100 mb-6 leading-relaxed border-l-4 border-primary-500 pl-4">
                {description}
             </p>
             
             {/* Render HTML Content Safely */}
             {/* In a real production app, use DOMPurify here. For this demo we trust Admin content. */}
             <div 
                className="mb-6 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: body || '' }}
             />
             
             {content.quiz && <QuizCard quiz={content.quiz} />}
          </div>

          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
             {(tags || []).map((tag, i) => (
                 <span key={i} className="px-4 py-1.5 bg-gray-50 dark:bg-[#151E32] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-200 dark:hover:border-primary-500/30 transition-colors cursor-pointer">#{tag}</span>
             ))}
          </div>

        </div>

        <div className="lg:col-span-1">
             <Sidebar />
        </div>
      </div>
    </div>
  );
};
