import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NewsItem } from '../types/news';
import { Container } from '../components/ui/Container';
import { Calendar, Tag, ExternalLink, ArrowRight, Newspaper, Filter, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const { Link } = ReactRouterDOM;

export const NewsListPage: React.FC = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublishedNews() {
      setLoading(true);
      setError(null);
      try {
        // Public can read only published news
        const q = query(
          collection(db, 'news'),
          where('status', '==', 'published')
        );
        const snapshot = await getDocs(q);
        const items: NewsItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as NewsItem) });
        });

        // Sort newest first by published_at or date or created_at
        items.sort((a, b) => {
          const timeA = new Date(a.published_at || a.date || a.created_at).getTime();
          const timeB = new Date(b.published_at || b.date || b.created_at).getTime();
          return timeB - timeA;
        });

        setArticles(items);
      } catch (err: any) {
        console.error('Failed to load published news:', err);
        setError('Мэдээ ачааллахад алдаа гарлаа.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'news');
        } catch {
          // Handled and logged
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublishedNews();
  }, []);

  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="py-8 md:py-12 bg-background min-h-screen">
      <Container>
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple mb-2">
                <Newspaper size={14} />
                <span>{language === 'mn' ? 'Мэдээ мэдээлэл' : 'Latest News'}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main">
                {language === 'mn' ? 'Мэдээний систем' : 'Channel News'}
              </h1>
              <p className="text-text-muted mt-1 text-sm md:text-base">
                {language === 'mn'
                  ? 'Сүүлийн үеийн баталгаажсан мэдээ, сурвалжлага, нийтлэлүүд'
                  : 'Verified news, briefings, and updates from reliable sources'}
              </p>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs text-text-muted flex items-center gap-1 mr-1">
                  <Filter size={14} />
                  <span>Шүүлт:</span>
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-purple text-white shadow-sm'
                        : 'bg-surface border border-border text-text-muted hover:text-text-main hover:bg-surfaceHighlight'
                    }`}
                  >
                    {cat === 'all' ? (language === 'mn' ? 'Бүгд' : 'All') : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface rounded-2xl p-5 border border-border space-y-4">
                <div className="h-44 bg-surfaceHighlight rounded-xl w-full" />
                <div className="h-4 bg-surfaceHighlight rounded w-1/4" />
                <div className="h-6 bg-surfaceHighlight rounded w-3/4" />
                <div className="h-16 bg-surfaceHighlight rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8 max-w-lg mx-auto">
            <p className="text-red-500 font-semibold mb-2">{error}</p>
            <p className="text-xs text-text-muted mb-4">Firestore сүлжээний холболтыг шалгана уу.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-purple text-white text-xs font-semibold rounded-lg hover:bg-brand-purple/90"
            >
              Дахин ачааллах
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border p-8 max-w-md mx-auto">
            <Newspaper size={44} className="mx-auto text-text-muted/50 mb-3" />
            <h3 className="text-lg font-bold text-text-main mb-1">
              {language === 'mn' ? 'Нийтлэгдсэн мэдээ хараахан байхгүй байна' : 'No published news yet'}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              {language === 'mn'
                ? 'Ноорог мэдээг нийтлэхийн тулд админ самбарт нэвтэрч "Publish" товчийг дарна уу.'
                : 'Admins can publish drafts from the /admin portal.'}
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-purple text-white text-xs font-semibold rounded-lg shadow-sm hover:opacity-95"
            >
              <span>Админ самбар луу очих</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const displayDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString()
                : article.date || new Date(article.created_at).toLocaleDateString();

              const imageUrl = article.image?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';

              return (
                <article
                  key={article.slug}
                  className="group bg-surface rounded-2xl border border-border hover:border-brand-purple/40 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Article Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold rounded-full uppercase tracking-wider">
                        {article.category || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-text-muted mb-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-brand-purple" />
                          <span>{displayDate}</span>
                        </span>
                        {article.sources && article.sources.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px] bg-surfaceHighlight px-2 py-0.5 rounded border border-border">
                            <ExternalLink size={11} />
                            <span>{article.sources.length} эх сурвалж</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-text-main line-clamp-2 group-hover:text-brand-purple transition-colors mb-2">
                        <Link to={`/news/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {/* Lead */}
                      <p className="text-xs md:text-sm text-text-muted line-clamp-3 leading-relaxed mb-4">
                        {article.lead}
                      </p>
                    </div>

                    {/* Footer / Read More */}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      {article.tags && article.tags.length > 0 ? (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Tag size={12} className="text-text-muted flex-shrink-0" />
                          <span className="text-[11px] text-text-muted truncate">
                            #{article.tags[0]}
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <Link
                        to={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
                      >
                        <span>Дэлгэрэнгүй</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
};
