
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { ThumbsUp, Share2, Bookmark, Eye, Calendar, User, PlayCircle, Layers } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { QuizCard } from '../components/QuizCard';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { KnowledgeCard } from '../components/KnowledgeCard';

const { useParams, Link } = ReactRouterDOM;

export const DetailPage: React.FC = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { trackView } = useUserPreferences();
  const { content: allContent } = useContent();
  const isEn = language === 'en';
  
  const content = allContent.find(c => c.id === id);
  
  // Logic for Related Articles: same category, excluding current
  const relatedContent = content 
      ? allContent.filter(c => c.category === content.category && c.id !== content.id).slice(0, 3)
      : [];
  
  // Fallback if not found (or still loading)
  if (!content) {
      return <div className="p-20 text-center text-text-muted animate-pulse">Loading content...</div>;
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
          
          <div className="flex items-center text-sm text-text-muted mb-6">
             <Link to="/" className="hover:text-brand-purple transition-colors font-medium">{t('nav_home')}</Link>
             <span className="mx-2 text-border">/</span>
             <Link to={`/${content.category}`} className="text-brand-purple font-semibold hover:underline decoration-brand-purple/30 underline-offset-4">{category}</Link>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-6 leading-tight tracking-tight">
            {title}
          </h1>

          <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surfaceHighlight rounded-full flex items-center justify-center border border-border">
                    <User size={20} className="text-text-muted" />
                </div>
                <div>
                    <p className="text-sm font-bold text-text-main">{t('admin')}</p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Calendar size={12} />
                        <span>{content.publishedDate}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                <Eye size={16} />
                <span>{content.views.toLocaleString()} {t('views')}</span>
            </div>
          </div>

          <div className="relative aspect-video bg-surfaceHighlight rounded-2xl overflow-hidden mb-10 shadow-lg dark:shadow-2xl border border-border group">
             <img src={content.thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
             {content.isVideo && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-20 h-20 bg-white/30 dark:bg-[#151E32]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 dark:border-white/30 shadow-lg dark:shadow-glow animate-pulse-fast">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2 drop-shadow-lg"></div>
                     </div>
                 </div>
             )}
          </div>

          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-text-main">
             {/* Description Intro */}
             <p className="font-serif text-xl md:text-2xl text-text-main mb-8 leading-relaxed border-l-4 border-brand-purple pl-6 italic opacity-90">
                {description}
             </p>
             
             {/* Render HTML Content Safely */}
             <div 
                className="mb-8 leading-relaxed whitespace-pre-wrap text-text-muted"
                dangerouslySetInnerHTML={{ __html: body || '' }}
             />
             
             {content.quiz && <QuizCard quiz={content.quiz} />}
          </div>

          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
             {(tags || []).map((tag, i) => (
                 <span key={i} className="px-4 py-1.5 bg-surfaceHighlight border border-border text-text-muted rounded-full text-sm font-medium hover:text-brand-purple hover:border-brand-purple/30 transition-colors cursor-pointer select-none">#{tag}</span>
             ))}
          </div>

          {/* Related Articles Section */}
          {relatedContent.length > 0 && (
             <div className="mt-16 pt-10 border-t border-border">
                <div className="flex items-center gap-3 mb-8">
                   <Layers className="text-brand-purple" size={24} />
                   <h3 className="text-2xl font-bold text-text-main">{t('related')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {relatedContent.map(item => (
                      <KnowledgeCard key={item.id} item={item} />
                   ))}
                </div>
             </div>
          )}

        </div>

        <div className="lg:col-span-1">
             <Sidebar />
        </div>
      </div>
    </div>
  );
};
