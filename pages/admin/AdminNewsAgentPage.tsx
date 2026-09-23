import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Bot, Sparkles, Send, CheckCircle2, Clock, ShieldCheck, 
  ExternalLink, Copy, Check, RefreshCw, Terminal, Layers, 
  ArrowRight, AlertCircle, FileText, Image as ImageIcon, Zap, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const { Link, useNavigate } = ReactRouterDOM;

interface AgentArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  thumbnail?: string;
  createdAt: string;
  agentNotes?: {
    short_idea?: string;
    fact_check?: string;
    ai_prompt?: string;
    image_note?: string;
    generated_by?: string;
    generated_at?: string;
  };
}

interface AgentStatusData {
  status: string;
  agentName: string;
  model: string;
  ingestionEndpoint: string;
  apiKeyConfigured: boolean;
  newsApiKey: string;
  stats: {
    total: number;
    drafts: number;
    published: number;
  };
  recentArticles: AgentArticle[];
}

export const AdminNewsAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'studio' | 'queue' | 'api'>('studio');
  const [statusData, setStatusData] = useState<AgentStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Studio form state
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Дэлхий');
  const [tone, setTone] = useState('Шуурхай мэдээ');
  const [sources, setSources] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<any | null>(null);

  // API docs copy states
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodeTab, setCopiedCodeTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch Agent Status
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/agent/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error('Failed to load agent status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle Generate
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    setGenerationError(null);
    setGeneratedArticle(null);

    try {
      const customSourcesList = sources.split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => ({ name: s, url: s.startsWith('http') ? s : '#' }));

      const res = await fetch('/api/admin/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          tone,
          customSources: customSourcesList
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedArticle(data.article);
        // Refresh status list in background
        fetchStatus();
      } else {
        throw new Error(data.error || 'Мэдээ бэлтгэхэд алдаа гарлаа.');
      }
    } catch (err: any) {
      setGenerationError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const quickPresets = [
    { title: 'Хиймэл оюуны шинэ загвар гарлаа', cat: 'Технологи' },
    { title: 'Жеймс Вэбб телескоп шинэ гариг илрүүлэв', cat: 'Шинжлэх ухаан' },
    { title: 'Дэлхийн төв банкны бодлогын шийдвэр', cat: 'Бизнес' },
    { title: 'Уур амьсгалын өөрчлөлт ба шинэ судалгаа', cat: 'Дэлхий' }
  ];

  const codeSnippets = {
    curl: `curl -X POST http://localhost:3000/api/news \\
  -H "Authorization: Bearer ${statusData?.newsApiKey || 'ch-mongolia-secret-news-key-2026'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "ai-news-update-2026",
    "title": "Хиймэл оюуны салбарт шинэ дэвшил гарлаа",
    "lead": "Шинжээчдийн үзэж буйгаар уг технологи нь мэдээллийн салбарыг үндсээр нь өөрчлөхөөр байна.",
    "body_markdown": "### Үйл явдлын тойм\\n\\nДэлхийн томоохон лабороториуд шинэ үеийн загваруудаа танилцууллаа.",
    "category": "Технологи",
    "tags": ["AI", "Технологи", "ШинжлэхУхаан"],
    "sources": [{"name": "Reuters", "url": "https://reuters.com"}],
    "image": {
      "url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      "ai_prompt": "Futuristic AI lab with digital screens"
    },
    "short_idea": "AI технологийн дараагийн том давалгаа эхэллээ.",
    "fact_check": "Албан ёсны тайланг эх сурвалжтай харьцуулан баталгаажуулсан."
  }'`,
    python: `import requests

url = "http://localhost:3000/api/news"
headers = {
    "Authorization": "Bearer ${statusData?.newsApiKey || 'ch-mongolia-secret-news-key-2026'}",
    "Content-Type": "application/json"
}
payload = {
    "slug": "world-economy-2026",
    "title": "Дэлхийн зах зээлийн шинэ өсөлт",
    "lead": "Ази болон Европын хөрөнгийн биржүүд дээр индексүүд эерэг хандлагатай байна.",
    "body_markdown": "### Зах зээлийн дүн шинжилгээ\\n\\nСүүлийн долоо хоногт арилжааны хэмжээ нэмэгдлээ.",
    "category": "Бизнес",
    "tags": ["ЭдийнЗасаг", "ХөрөнгийнБирж"],
    "sources": [{"name": "Bloomberg", "url": "https://bloomberg.com"}],
    "short_idea": "Хөрөнгө оруулагчдын итгэл сэргэж эхэллээ.",
    "fact_check": "Биржийн бодит дататай шалгаж баталгаажуулсан."
}

res = requests.post(url, json=payload, headers=headers)
print(res.status_code, res.json())`,
    js: `const axios = require('axios');

async function pushNews() {
  const response = await axios.post('http://localhost:3000/api/news', {
    slug: 'science-discovery-2026',
    title: 'Ангараг гариг дээрх шинэ олдвор',
    lead: 'Эрдэмтэд Ангарагийн хөрснөөс эртний усны ул мөрийг илрүүлжээ.',
    body_markdown: '### Шинжлэх ухааны нээлт\\n\\nУг судалгааг олон улсын баг хамтран гүйцэтгэв.',
    category: 'Шинжлэх ухаан',
    tags: ['Сансар', 'Ангараг', 'Нээлт'],
    sources: [{ name: 'NASA', url: 'https://nasa.gov' }],
    short_idea: 'Ангараг дээр амьдрал байсан байх магадлал улам бүр өслөө.'
  }, {
    headers: {
      'Authorization': 'Bearer ${statusData?.newsApiKey || 'ch-mongolia-secret-news-key-2026'}',
      'Content-Type': 'application/json'
    }
  });

  console.log('Result:', response.data);
}

pushNews();`
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner / Agent Identity */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-purple/20 via-surface to-brand-orange/10 border border-brand-purple/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-brand-purple/30">
                <Bot size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
                    Мэдээ Бэлтгэгч Агент
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ОНЛАЙН
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Gemini 3.8 Flash • Факт-чек шалгалт • Автомат нийтлэл бэлтгэгч & Webhook систем
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="px-4 py-2.5 bg-surface hover:bg-surfaceHighlight border border-border text-text-main text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} className={loadingStatus ? 'animate-spin' : ''} />
              <span>Шинэчлэх</span>
            </button>
            <Link
              to="/admin/articles/create"
              className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <FileText size={14} />
              <span>Гар аргаар бичих</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Нийт бэлтгэсэн</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-text-main">{statusData?.stats.total ?? 0}</span>
              <span className="text-xs text-text-muted">нийтлэл</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Ноорогт хүлээгдэж буй</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{statusData?.stats.drafts ?? 0}</span>
              <span className="text-xs text-text-muted">хянах</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Нийтлэгдсэн</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{statusData?.stats.published ?? 0}</span>
              <span className="text-xs text-text-muted">уншигчдад</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider block">AI Загвар</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-bold text-text-main truncate">Gemini 3.8</span>
              <span className="text-xs text-emerald-400 font-semibold">Идэвхтэй</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('studio')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'studio'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Sparkles size={16} />
          <span>Мэдээ Бэлтгэх (Agent Studio)</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'queue'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Layers size={16} />
          <span>Бэлтгэсэн мэдээнүүд ({statusData?.recentArticles.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'api'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Terminal size={16} />
          <span>API & Автоматжуулалт (Webhook)</span>
        </button>
      </div>

      {/* TAB 1: STUDIO */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Instructions for Agent */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <Zap size={18} className="text-brand-orange" />
                  <span>Агентад даалгавар өгөх</span>
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Сэдэв, түүхий мэдээлэл эсвэл үйл явдлыг оруулбал Агент факт-чек хийж, бүтэн мэдээ бэлтгэн CMS-д ноорог байдлаар шууд оруулна.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Санал болгох сэдвүүд:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopic(p.title);
                        setCategory(p.cat);
                      }}
                      className="px-3 py-1.5 bg-surfaceHighlight hover:bg-brand-purple/10 hover:text-brand-purple border border-border hover:border-brand-purple/30 rounded-xl text-xs font-medium text-text-muted transition-all"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main">
                    Сэдэв эсвэл мэдээний агуулга <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Жишээ нь: Шинэ олдсон экзопланет дээр усны уур илэрсэн тухай судалгаа нийтлэгдлээ..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-sm text-text-main outline-none focus:border-brand-purple/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-main">Ангилал</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-text-main outline-none focus:border-brand-purple/50 transition-colors"
                    >
                      <option value="Дэлхий">Дэлхий (World)</option>
                      <option value="Технологи">Технологи (Tech)</option>
                      <option value="Шинжлэх ухаан">Шинжлэх ухаан (Science)</option>
                      <option value="Бизнес">Бизнес (Economy)</option>
                      <option value="Нийгэм">Нийгэм (Society)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-main">Хэв маяг / Тон</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-text-main outline-none focus:border-brand-purple/50 transition-colors"
                    >
                      <option value="Шуурхай мэдээ">Шуурхай мэдээ (Breaking)</option>
                      <option value="Дүн шинжилгээ">Дүн шинжилгээ (Analysis)</option>
                      <option value="Танин мэдэхүй">Танин мэдэхүй (Educational)</option>
                      <option value="Тойм нийтлэл">Тойм нийтлэл (Feature Overview)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-main">
                    Нэмэлт эх сурвалжийн холбоос (сонголттой)
                  </label>
                  <input
                    type="text"
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    placeholder="https://example.com/news/123 (мөр бүрт нэг холбоос)"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-text-main outline-none focus:border-brand-purple/50 transition-colors font-mono"
                  />
                </div>

                {generationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="w-full py-3.5 px-6 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Агент судалгаа хийж, нийтлэл бэлтгэж байна...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Агентаар Мэдээ Бэлтгүүлэх</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Area: Live Preview / Generated Result */}
          <div className="lg:col-span-6 space-y-6">
            {generatedArticle ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    <span>Амжилттай бэлтгэгдэж, ноорогт хадгалагдлаа!</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[11px] border border-amber-500/20">
                    DRAFT
                  </span>
                </div>

                {generatedArticle.thumbnail && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-md">
                    <img src={generatedArticle.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-[11px]">
                    {generatedArticle.category}
                  </span>
                  <h3 className="text-xl font-black text-text-main leading-snug">
                    {generatedArticle.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed italic border-l-2 border-brand-purple pl-3">
                    {generatedArticle.excerpt}
                  </p>
                </div>

                {/* Fact Check Box */}
                {generatedArticle.agentNotes?.fact_check && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <ShieldCheck size={14} />
                      <span>Факт-чекийн шалгалт:</span>
                    </div>
                    <p className="text-xs text-text-muted">
                      {generatedArticle.agentNotes.fact_check}
                    </p>
                  </div>
                )}

                {/* AI Image prompt recommendation */}
                {generatedArticle.agentNotes?.ai_prompt && (
                  <div className="p-3 bg-background border border-border rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Зургийн AI Prompt:
                    </span>
                    <p className="text-xs font-mono text-text-muted">
                      {generatedArticle.agentNotes.ai_prompt}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to={`/admin/articles/edit/${generatedArticle.id}`}
                    className="flex-1 py-3 px-4 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Засварлагч руу шилжих (Зураг нэмэх / Нийтлэх)</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface border border-dashed border-border rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[420px] text-text-muted space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shadow-inner">
                  <Bot size={32} />
                </div>
                <div className="max-w-sm space-y-1">
                  <h4 className="font-bold text-text-main text-base">Бэлтгэсэн мэдээний урьдчилсан харагдац</h4>
                  <p className="text-xs text-text-muted">
                    Зүүн талын талбарт сэдвээ оруулж "Агентаар Мэдээ Бэлтгүүлэх" товчийг дарснаар үр дүн энд харагдана.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-main">
                Агентын бэлтгэсэн & оруулсан нийтлэлүүд
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                AI агент болон гадаад Webhook API-аар дамжин орж ирсэн нийтлэлүүдийн хяналт
              </p>
            </div>
            <button
              onClick={fetchStatus}
              className="p-2 hover:bg-surfaceHighlight rounded-xl text-text-muted hover:text-text-main transition-colors"
              title="Шинэчлэх"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {!statusData?.recentArticles || statusData.recentArticles.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm border border-dashed border-border rounded-2xl">
              Одоогоор Агентаар бэлтгэгдсэн нийтлэл байхгүй байна. "Мэдээ Бэлтгэх" цонхоор анхны нийтлэлээ үүсгэнэ үү.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {statusData.recentArticles.map((art) => (
                <div key={art.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex items-start gap-4 min-w-0">
                    {art.thumbnail && (
                      <div className="w-16 h-12 rounded-xl bg-surfaceHighlight overflow-hidden flex-shrink-0 border border-border">
                        <img src={art.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple text-[10px] font-bold">
                          {art.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {art.status}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {new Date(art.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-main truncate max-w-xl group-hover:text-brand-purple transition-colors">
                        {art.title}
                      </h4>
                      {art.agentNotes?.short_idea && (
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          💡 {art.agentNotes.short_idea}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/admin/articles/edit/${art.id}`}
                      className="px-3.5 py-1.5 bg-surfaceHighlight hover:bg-brand-purple hover:text-white border border-border text-text-main text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <FileText size={13} />
                      <span>Засах</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: API & INTEGRATION DOCS */}
      {activeTab === 'api' && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Terminal size={18} className="text-brand-purple" />
              <span>Автоматжуулалт & API Ingestion</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Гадаад автомат бот, scraper, RSS уншигч эсвэл n8n/Make платформоос шууд Channel Mongolia систем рүү мэдээ илгээх заавар
            </p>
          </div>

          {/* API Key Box */}
          <div className="p-5 bg-background border border-border rounded-2xl space-y-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Мэдээний API Нууц Түлхүүр (NEWS_API_KEY)
            </span>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-xs font-mono text-brand-purple select-all">
                {statusData?.newsApiKey || 'ch-mongolia-secret-news-key-2026'}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(statusData?.newsApiKey || 'ch-mongolia-secret-news-key-2026', 'key')}
                className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey ? 'Хуулагдлаа' : 'Хуулах'}</span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted">
              Хүсэлт илгээхдээ Header-т <code className="text-brand-purple font-mono">Authorization: Bearer [KEY]</code> хэлбэрээр илгээнэ.
            </p>
          </div>

          {/* Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Шалгах холбоос</span>
              <p className="text-xs font-mono text-text-main font-bold">GET /api/news/health</p>
              <p className="text-[11px] text-text-muted">Серверийн ажиллагааг шалгахад 200 OK буцаана.</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">Мэдээ оруулах</span>
              <p className="text-xs font-mono text-text-main font-bold">POST /api/news</p>
              <p className="text-[11px] text-text-muted">Шинэ мэдээг DRAFT төлөвтэй шууд хадгална.</p>
            </div>
          </div>

          {/* Code Snippets Box */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-surfaceHighlight px-4 py-2 border-b border-border">
              <div className="flex space-x-1">
                <button
                  onClick={() => setCopiedCodeTab('curl')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    copiedCodeTab === 'curl' ? 'bg-surface text-brand-purple shadow-sm' : 'text-text-muted'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setCopiedCodeTab('python')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    copiedCodeTab === 'python' ? 'bg-surface text-brand-purple shadow-sm' : 'text-text-muted'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setCopiedCodeTab('js')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    copiedCodeTab === 'js' ? 'bg-surface text-brand-purple shadow-sm' : 'text-text-muted'
                  }`}
                >
                  Node.js / JS
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(codeSnippets[copiedCodeTab], 'code')}
                className="text-xs text-text-muted hover:text-text-main flex items-center gap-1 font-medium"
              >
                {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedCode ? 'Хуулагдлаа' : 'Код хуулах'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{codeSnippets[copiedCodeTab]}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
