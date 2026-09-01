
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { ThumbsUp, Share2, Bookmark, Eye, Calendar, User, PlayCircle, Layers, ArrowLeft, MessageSquare } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { QuizCard } from '../components/QuizCard';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { ReadingProgress } from '../components/ReadingProgress';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const { useParams, Link, useNavigate } = ReactRouterDOM;

export const DetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { trackView } = useUserPreferences();
  const { content: allContent } = useContent();
  const isEn = language === 'en';
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const content = allContent.find(c => c.id === id);
  
  // Logic for Related Articles: same category, excluding current
  const relatedContent = content 
      ? allContent.filter(c => c.category === content.category && c.id !== content.id).slice(0, 3)
      : [];
  
  useEffect(() => {
     if(content?.category) {
         trackView(content.category);
     }
     window.scrollTo(0, 0);
  }, [id, content?.category]);

  if (!content) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-muted font-medium animate-pulse">{t('loading') || 'Loading content...'}</p>
          </div>
        </div>
      );
  }
  
  const title = isEn ? content.title_en : content.title;
  const description = isEn ? content.description_en : content.description;
  const body = isEn ? content.contentBody_en : (content.contentBody || content.description);
  const category = isEn ? content.category_en : content.category;
  const tags = isEn ? content.tags_en : content.tags;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <ReadingProgress />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button - Floating on Desktop */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-brand-purple transition-colors font-bold group"
          >
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            <span>{t('back') || 'Back'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center text-sm text-text-muted mb-6 font-bold tracking-widest uppercase">
                 <Link to="/" className="hover:text-brand-purple transition-colors">{t('nav_home')}</Link>
                 <span className="mx-3 opacity-30">/</span>
                 <Link to={`/${content.category}`} className="text-brand-purple hover:underline underline-offset-4">{category}</Link>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-text-main mb-8 leading-[1.1] tracking-tighter">
                {title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-6 border-y border-border py-8 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-base font-bold text-text-main leading-none mb-1">{t('admin')}</p>
                        <div className="flex items-center gap-3 text-xs text-text-muted font-medium uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{content.publishedDate}</span>
                            </div>
                            <span className="opacity-30">•</span>
                            <div className="flex items-center gap-1">
                              <Eye size={12} />
                              <span>{(content.views || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                      "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-sm",
                      isLiked ? "bg-red-500 border-red-500 text-white shadow-red-200" : "bg-surface border-border text-text-muted hover:border-red-500 hover:text-red-500"
                    )}
                  >
                    <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={cn(
                      "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-sm",
                      isBookmarked ? "bg-brand-purple border-brand-purple text-white shadow-purple-200" : "bg-surface border-border text-text-muted hover:border-brand-purple hover:text-brand-purple"
                    )}
                  >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="w-12 h-12 rounded-2xl border border-border bg-surface flex items-center justify-center text-text-muted hover:border-brand-orange hover:text-brand-orange transition-all shadow-sm"
                  >
                    <Share2 size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {content.isVideo ? (() => {
              const getYouTubeId = (url: string | undefined): string | null => {
                if (!url) return null;
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
              };

              const ytId = getYouTubeId(content.videoUrl);
              
              return (
                <div className="relative mb-12 group/video-container">
                  {/* Immersive YouTube Ambient Backglow Effect */}
                  <div 
                    className="absolute -inset-4 md:-inset-12 bg-cover bg-center rounded-[40px] opacity-70 dark:opacity-60 blur-[60px] md:blur-[110px] pointer-events-none z-0 transition-all duration-1000 scale-[1.05]"
                    style={{ backgroundImage: `url(${content.thumbnailUrl})` }}
                  />
                  
                  {/* Cinema Theater Frame */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative z-10 aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 dark:border-white/5"
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </motion.div>
                  
                  {/* Subtle Theater Ambient lighting indicator */}
                  <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted px-2 font-mono uppercase tracking-wider relative z-10">
                    <div className="flex items-center gap-1.5 text-brand-purple">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-sm shadow-red-500" />
                      <span className="font-bold">Кино Театр Горим</span>
                    </div>
                    <span className="opacity-80">Ambient Backglow Viridian</span>
                  </div>
                </div>
              );
            })() : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative aspect-video bg-surfaceHighlight rounded-3xl overflow-hidden mb-12 shadow-2xl border border-border group"
            >
               <img src={content.thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]" />
               {content.isVideo && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                       <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-2xl cursor-pointer group/play"
                       >
                          <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[30px] border-l-white border-b-[18px] border-b-transparent ml-2 drop-shadow-2xl group-hover/play:scale-110 transition-transform"></div>
                       </motion.div>
                   </div>
               )}
            </motion.div>
          )}

            <article className="max-w-none">
               {/* Description Intro */}
               <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-serif text-2xl md:text-3xl text-text-main mb-12 leading-relaxed border-l-8 border-brand-purple pl-8 italic opacity-90 font-medium"
               >
                  {description}
               </motion.p>
               
               {/* Render HTML Content Safely */}
               <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-12 leading-[1.8] text-lg md:text-xl text-text-main/80 space-y-8 font-light"
                  dangerouslySetInnerHTML={{ __html: body || '' }}
               />
               
               {content.quiz && (
                 <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="my-16"
                 >
                   <QuizCard quiz={content.quiz} />
                 </motion.div>
               )}
            </article>

            <div className="flex flex-wrap gap-3 mt-16 pt-10 border-t border-border">
               {(tags || []).map((tag, i) => (
                   <motion.span 
                    key={i} 
                    whileHover={{ y: -2, scale: 1.05 }}
                    className="px-5 py-2 bg-surfaceHighlight border border-border text-text-muted rounded-2xl text-sm font-bold uppercase tracking-wider hover:text-brand-purple hover:border-brand-purple/30 transition-all cursor-pointer shadow-sm"
                   >
                    #{tag}
                   </motion.span>
               ))}
            </div>

            {/* Related Articles Section */}
            {relatedContent.length > 0 && (
               <div className="mt-24 pt-16 border-t border-border">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple shadow-inner">
                          <Layers size={24} />
                       </div>
                       <h3 className="text-3xl font-black text-text-main tracking-tight uppercase italic">{t('related')}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {relatedContent.map(item => (
                        <KnowledgeCard key={item.id} item={item} />
                     ))}
                  </div>
               </div>
            )}

          </div>

          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-24 space-y-12">
                <Sidebar />
                
                {/* Newsletter Widget */}
                <div className="p-8 bg-gradient-brand rounded-3xl text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <h4 className="text-xl font-bold mb-2 relative z-10">Stay Updated</h4>
                  <p className="text-white/80 text-sm mb-6 relative z-10">Get the latest knowledge delivered to your inbox weekly.</p>
                  <div className="space-y-3 relative z-10">
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 ring-white/30 transition-all"
                    />
                    <button className="w-full py-3 rounded-2xl bg-white text-brand-purple font-bold hover:bg-brand-orange hover:text-white transition-all shadow-lg active:scale-95">
                      Subscribe
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
