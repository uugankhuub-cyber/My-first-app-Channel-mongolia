import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import DOMPurify from 'dompurify';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NewsItem } from '../types/news';
import { Container } from '../components/ui/Container';
import {
  Calendar,
  ExternalLink,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const { useParams, Link } = ReactRouterDOM;

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, 'news', slug);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Мэдээ олдсонгүй эсвэл хараахан нийтлэгдээгүй байна.');
          return;
        }

        const data = docSnap.data() as NewsItem;
        if (data.status !== 'published') {
          setError('Энэхүү мэдээ хараахан нийтлэгдээгүй байна (Ноорог).');
          return;
        }

        setArticle({ id: docSnap.id, ...data });

        // Set <title> and meta description from seo / article
        const pageTitle = data.title ? `${data.title} - Channel Mongolia` : 'News - Channel Mongolia';
        document.title = pageTitle;

        const metaDescription = data.seo?.meta_description || data.lead || data.title;
        let metaTag = document.querySelector('meta[name="description"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'description');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', metaDescription);
      } catch (err: any) {
        console.error('Error fetching news article:', err);
        setError('Мэдээ уншихад алдаа гарлаа.');
        try {
          handleFirestoreError(err, OperationType.GET, `news/${slug}`);
        } catch {
          // Handled and logged
        }
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();

    // Reset title on unmount
    return () => {
      document.title = 'Channel Mongolia';
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-12 md:py-20 min-h-screen bg-background">
        <Container className="max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-surfaceHighlight rounded w-24" />
            <div className="h-10 bg-surfaceHighlight rounded w-3/4" />
            <div className="h-6 bg-surfaceHighlight rounded w-full" />
            <div className="h-80 bg-surfaceHighlight rounded-2xl w-full" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-surfaceHighlight rounded w-full" />
              <div className="h-4 bg-surfaceHighlight rounded w-5/6" />
              <div className="h-4 bg-surfaceHighlight rounded w-4/6" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-20 min-h-[60vh] flex items-center justify-center bg-background">
        <Container className="max-w-md text-center">
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
            <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
            <h2 className="text-xl font-bold text-text-main mb-2">Мэдээ олдсонгүй</h2>
            <p className="text-sm text-text-muted mb-6">{error || 'Таны хайсан мэдээ олдсонгүй.'}</p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:bg-brand-purple/90 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Мэдээний жагсаалт руу буцах</span>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Sanitize body markdown safely
  const sanitizedMarkdown = DOMPurify.sanitize(article.body_markdown || '');
  const displayDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : article.date || new Date(article.created_at).toLocaleDateString();

  return (
    <article className="py-8 md:py-14 bg-background min-h-screen">
      <Container className="max-w-4xl">
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-purple transition-colors"
          >
            <ArrowLeft size={15} />
            <span>{language === 'mn' ? 'Бүх мэдээ' : 'All News'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-text-muted hover:text-text-main hover:bg-surfaceHighlight transition-colors"
              title="Холбоос хуулах"
            >
              <Share2 size={13} />
              <span>{copied ? 'Хуулагдлаа!' : 'Хуваалцах'}</span>
            </button>
          </div>
        </div>

        {/* Article Category & Title */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple uppercase tracking-wider">
              {article.category || 'General'}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar size={13} className="text-brand-purple" />
              <span>{displayDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-text-main leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Lead Paragraph */}
          {article.lead && (
            <div className="text-base sm:text-lg md:text-xl font-normal text-text-muted leading-relaxed border-l-4 border-brand-purple pl-4 py-1 italic bg-surfaceHighlight/50 rounded-r-xl">
              {article.lead}
            </div>
          )}
        </div>

        {/* Hero Image */}
        {article.image?.url && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-border bg-slate-900 shadow-md">
            <img
              src={article.image.url}
              alt={article.title}
              className="w-full max-h-[500px] object-cover"
            />
            {article.image.note && (
              <div className="px-4 py-2 bg-surface text-xs text-text-muted italic border-t border-border flex items-center justify-between">
                <span>{article.image.note}</span>
                {article.image.ai_prompt && (
                  <span className="text-[10px] text-brand-purple opacity-70">AI Generated</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Short Idea / Key Hook Callout if available */}
        {article.short_idea && (article.short_idea.hook || article.short_idea.outline) && (
          <div className="mb-8 p-4 md:p-5 rounded-2xl bg-brand-purple/5 border border-brand-purple/20">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-wider mb-2">
              <Sparkles size={15} />
              <span>Гол санаа / Хураангуй</span>
            </div>
            {article.short_idea.hook && (
              <p className="text-sm font-semibold text-text-main mb-1">
                {article.short_idea.hook}
              </p>
            )}
            {article.short_idea.outline && (
              <p className="text-xs text-text-muted leading-relaxed">
                {article.short_idea.outline}
              </p>
            )}
          </div>
        )}

        {/* Safe Render of Markdown Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none mb-12 text-text-main leading-relaxed text-base md:text-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              h1: ({ ...props }) => <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-text-main" {...props} />,
              h2: ({ ...props }) => <h3 className="text-xl md:text-2xl font-bold mt-6 mb-3 text-text-main" {...props} />,
              h3: ({ ...props }) => <h4 className="text-lg md:text-xl font-semibold mt-5 mb-2 text-text-main" {...props} />,
              p: ({ ...props }) => <p className="mb-4 text-text-main/90 leading-relaxed" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-text-main/90" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-text-main/90" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-brand-purple pl-4 italic text-text-muted my-4" {...props} />
              ),
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple underline hover:text-brand-purple/80 font-medium"
                  {...props}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt, ...props }) => (
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-xl my-6 max-h-96 w-auto mx-auto object-cover border border-border"
                  {...props}
                />
              )
            }}
          >
            {sanitizedMarkdown}
          </ReactMarkdown>
        </div>

        {/* Fact Check Section if available */}
        {article.fact_check && article.fact_check.length > 0 && (
          <div className="mb-10 p-5 rounded-2xl bg-surface border border-border">
            <div className="flex items-center gap-2 text-sm font-bold text-text-main mb-3">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>Баримт шалгалт (Fact Check)</span>
            </div>
            <div className="space-y-3">
              {article.fact_check.map((item: any, idx: number) => {
                const isObj = typeof item === 'object' && item !== null;
                const claim = isObj ? item.claim || item.statement : String(item);
                const verification = isObj ? item.verification || item.note : null;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-surfaceHighlight/50 border border-border text-xs">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-text-main">{claim}</p>
                        {verification && <p className="text-text-muted mt-1">{verification}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-10 pt-4 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1 mr-2">
              <Tag size={13} />
              <span>Шошго:</span>
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-surfaceHighlight text-text-main rounded-full text-xs font-medium border border-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Sources Section as links at the bottom (Required by prompt) */}
        {article.sources && article.sources.length > 0 && (
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-text-main mb-3">
              <ExternalLink size={16} className="text-brand-purple" />
              <span>Эх сурвалжууд (Sources):</span>
            </div>
            <ul className="space-y-2">
              {article.sources.map((source, index) => (
                <li key={index} className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple flex-shrink-0" />
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-purple hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <span>{source.name}</span>
                    <ExternalLink size={12} className="opacity-70 flex-shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </article>
  );
};
