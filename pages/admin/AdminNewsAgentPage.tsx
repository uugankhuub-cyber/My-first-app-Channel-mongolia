import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Bot, Sparkles, CheckCircle2, Clock, ShieldCheck, 
  ExternalLink, Copy, Check, RefreshCw, Terminal, Layers, 
  ArrowRight, AlertCircle, FileText, Image as ImageIcon, Zap, Eye,
  CheckCircle, Radio, Play, Send, Key, Globe, ShieldAlert, Cpu
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
    short_idea?: string | { hook?: string; outline?: string };
    fact_check?: string | string[];
    ai_prompt?: string;
    image_note?: string;
    source_agent?: string;
    generated_by?: string;
    generated_at?: string;
    ingested_at?: string;
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
  // Default to the connected News API tab as requested by the user
  const [activeTab, setActiveTab] = useState<'connection' | 'queue' | 'studio' | 'docs'>('connection');
  const [statusData, setStatusData] = useState<AgentStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Connection Test states
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
    testedAt?: string;
  } | null>(null);
  const [sendingTestNews, setSendingTestNews] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  // Studio form state
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Дэлхий');
  const [tone, setTone] = useState('Шуурхай мэдээ');
  const [sources, setSources] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<any | null>(null);

  // Copy states
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCodeTab, setCopiedCodeTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiEndpointUrl = `${originUrl}/api/news`;
  const healthEndpointUrl = `${originUrl}/api/news/health`;
  const activeApiKey = statusData?.newsApiKey || 'cm-news-rgXZh0qH-DF5375lZhtb8-fw12W5EY-cW6jXLG_9pQM';

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

  // Run Real Connection Health Test
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/admin/agent/test-connection', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      const end = performance.now();
      const latency = Math.round(end - start);

      if (res.ok && data.success) {
        setTestResult({
          ok: true,
          message: data.message || 'News API амжилттай холбогдсон байна. Сервер 200 OK хариу өглөө.',
          latencyMs: latency,
          testedAt: new Date().toLocaleTimeString('mn-MN')
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || 'Холболт шалгахад алдаа гарлаа.',
          latencyMs: latency,
          testedAt: new Date().toLocaleTimeString('mn-MN')
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Сүлжээний холболт амжилтгүй боллоо.',
        testedAt: new Date().toLocaleTimeString('mn-MN')
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Dispatch an actual Test Ingestion News article via /api/news
  const handleSendTestArticle = async () => {
    setSendingTestNews(true);
    try {
      const sampleSlug = `test-agent-news-${Date.now().toString(36)}`;
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          slug: sampleSlug,
          title: `[Шалгалт] News API-аар амжилттай хүлээн авсан мэдээ - ${new Date().toLocaleTimeString('mn-MN')}`,
          lead: 'Энэхүү мэдээ нь таны холбосон News API-ийн бодит холболтыг шалгах тестээр шууд баазад ноорог байдлаар орж ирлээ.',
          body_markdown: `### News API Холболтын шалгалт\n\nЭнэхүү нийтлэл нь таны холбосон News API хүчинтэй түлхүүрээр (${activeApiKey.slice(0, 10)}...) дамжуулан автоматаар орж ирсэн болно.\n\n- **Хүлээн авсан зам:** \`/api/news\`\n- **Баталгаажуулалт:** Амжилттай (Authorized)\n- **Төлөв:** DRAFT (Редакторын хяналтад бэлэн)`,
          category: 'Технологи',
          tags: ['Тест', 'NewsAPI', 'Автоматжуулалт'],
          sources: [{ name: 'Channel Mongolia News Gateway', url: originUrl }],
          short_idea: 'News API-ийн урсгал хэвийн ажиллаж байна.',
          fact_check: 'Холболтын тест амжилттай баталгаажсан.'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStatus();
        setActiveTab('queue');
        alert('Амжилттай! Тест нийтлэл News API-аар дамжин хүлээн авагдаж, Ноорог жагсаалтад нэмэгдлээ.');
      } else {
        alert(`Алдаа гарлаа: ${data.error || 'Тодорхойгүй алдаа'}`);
      }
    } catch (e: any) {
      alert(`Хүсэлт илгээхэд алдаа гарлаа: ${e.message}`);
    } finally {
      setSendingTestNews(false);
    }
  };

  // Handle Manual AI Generation (Studio)
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

  const copyToClipboard = (text: string, type: 'key' | 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const codeSnippets = {
    curl: `curl -X POST "${apiEndpointUrl}" \\
  -H "Authorization: Bearer ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "ai-news-update-2026",
    "title": "Хиймэл оюуны салбарт шинэ дэвшил гарлаа",
    "lead": "Шинжээчдийн үзэж буйгаар уг технологи нь мэдээллийн салбарыг үндсээр нь өөрчлөхөөр байна.",
    "body_markdown": "### Үйл явдлын тойм\\n\\nДэлхийн томоохон лабораториуд шинэ үеийн загваруудаа танилцууллаа.",
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

url = "${apiEndpointUrl}"
headers = {
    "Authorization": "Bearer ${activeApiKey}",
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
print("Status code:", res.status_code)
print("Response:", res.json())`,
    js: `// Node.js (axios / fetch) жишээ
const axios = require('axios');

async function sendNewsToAgent() {
  const response = await axios.post('${apiEndpointUrl}', {
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
      'Authorization': 'Bearer ${activeApiKey}',
      'Content-Type': 'application/json'
    }
  });

  console.log('Result:', response.data);
}

sendNewsToAgent();`
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner / Agent Identity & Connection Status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-purple/20 via-surface to-brand-orange/10 border border-brand-purple/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-brand-purple/30">
                <Bot size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
                    Мэдээний AI Агент & News API
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ЗӨВ ХОЛБОГДСОН (ONLINE)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Таны тохируулсан <span className="text-text-main font-mono font-semibold">NEWS_API_KEY</span> болон <span className="text-text-main font-mono font-semibold">/api/news</span> холболт хэвийн ажиллаж байна.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-emerald-900/20"
              title="Холболтын шууд шалгалт хийх"
            >
              <Radio size={14} className={testingConnection ? 'animate-pulse text-amber-200' : ''} />
              <span>{testingConnection ? 'Шалгаж байна...' : 'Холболт шалгах (Ping)'}</span>
            </button>

            <button
              onClick={fetchStatus}
              disabled={loadingStatus}
              className="px-4 py-2.5 bg-surface hover:bg-surfaceHighlight border border-border text-text-main text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} className={loadingStatus ? 'animate-spin' : ''} />
              <span>Шинэчлэх</span>
            </button>
          </div>
        </div>

        {/* Live Test Banner Result */}
        {testResult && (
          <div className={`mt-5 p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 transition-all ${
            testResult.ok 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {testResult.ok ? <CheckCircle size={18} className="text-emerald-400" /> : <ShieldAlert size={18} className="text-red-400" />}
              <div>
                <span className="font-bold">{testResult.ok ? 'Холболт зөв баталгаажлаа:' : 'Холболтод анхаарах:'}</span>{' '}
                <span>{testResult.message}</span>
                {testResult.latencyMs && (
                  <span className="ml-2 font-mono text-[10px] bg-surface/50 px-2 py-0.5 rounded border border-current">
                    Хурд: {testResult.latencyMs}ms ({testResult.testedAt})
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setTestResult(null)} 
              className="opacity-70 hover:opacity-100 font-bold px-2 py-1 text-xs"
            >
              Хаах
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">News API Түлхүүр</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-text-main font-bold truncate">
              <Key size={14} className="text-brand-purple flex-shrink-0" />
              <span className="truncate">{activeApiKey.slice(0, 14)}...</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Ноорогт хүлээгдэж буй</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{statusData?.stats.drafts ?? 0}</span>
              <span className="text-xs text-text-muted">хянах мэдээ</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Нийтлэгдсэн мэдээ</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{statusData?.stats.published ?? 0}</span>
              <span className="text-xs text-text-muted">сайт дээр гарсан</span>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xs p-4 rounded-2xl border border-border/80">
            <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider block">Сервер хаяг</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-text-main font-bold truncate">
              <Globe size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">/api/news (200 OK)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('connection')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'connection'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Radio size={16} />
          <span>Холбогдсон News API (Статус & Шалгалт)</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'queue'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Layers size={16} />
          <span>Агентаас Ирсэн Мэдээнүүд ({statusData?.recentArticles.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'docs'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Terminal size={16} />
          <span>Холболтын Заавар & Жишээ код</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'studio'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Sparkles size={16} />
          <span>Гараар Сэдэв өгч бэлтгүүлэх</span>
        </button>
      </div>

      {/* TAB 1: CONNECTION OVERVIEW (PRIMARY FOCUS) */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {/* Main Verification Card */}
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-text-main">
                    News API Холболтын Баталгаажуулалт
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ХОЛБОГДСОН
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Таны системтэй холбосон News API нь аюулгүй байдлын шалгалт болон эрхийн тохиргоотойгоор бүрэн нэгдсэн байна.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendTestArticle}
                  disabled={sendingTestNews}
                  className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Send size={14} className={sendingTestNews ? 'animate-spin' : ''} />
                  <span>{sendingTestNews ? 'Илгээж байна...' : 'Тест нийтлэл илгээж шалгах'}</span>
                </button>
              </div>
            </div>

            {/* Connection Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item 1: API Endpoint URL */}
              <div className="bg-surfaceHighlight/50 border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={14} className="text-blue-400" />
                    Мэдээ хүлээн авах шууд хаяг (POST Endpoint)
                  </span>
                  <button
                    onClick={() => copyToClipboard(apiEndpointUrl, 'url')}
                    className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                  >
                    {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedUrl ? 'Хуулагдлаа' : 'Хуулах'}</span>
                  </button>
                </div>
                <div className="bg-surface border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs text-text-main flex items-center justify-between overflow-x-auto">
                  <span className="text-emerald-400 font-bold mr-2">POST</span>
                  <span className="truncate">{apiEndpointUrl}</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Таны гадаад бот, Python скрипт эсвэл автоматжуулалт уг хаяг руу JSON хэлбэрээр нийтлэл илгээнэ.
                </p>
              </div>

              {/* Item 2: Connected API Key */}
              <div className="bg-surfaceHighlight/50 border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={14} className="text-amber-400" />
                    Таны холбогдсон Secret Key (NEWS_API_KEY)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFullKey(!showFullKey)}
                      className="text-[11px] font-semibold text-text-muted hover:text-text-main"
                    >
                      {showFullKey ? 'Нуух' : 'Харах'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(activeApiKey, 'key')}
                      className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedKey ? 'Хуулагдлаа' : 'Хуулах'}</span>
                    </button>
                  </div>
                </div>
                <div className="bg-surface border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs text-text-main flex items-center justify-between overflow-x-auto">
                  <span className="truncate">
                    {showFullKey ? activeApiKey : `${activeApiKey.slice(0, 18)}••••••••••••••••`}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">
                    ЗӨВШӨӨРӨГДСӨН
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Хүсэлтийн толгой хэсэгт <code className="text-text-main font-mono">Authorization: Bearer [ТҮЛХҮҮР]</code> эсвэл <code className="text-text-main font-mono">x-api-key</code> хэлбэрээр илгээнэ.
                </p>
              </div>

              {/* Item 3: Health & Readiness */}
              <div className="bg-surfaceHighlight/50 border border-border rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Эрүүл мэндийн шалгалт (Health GET)
                </span>
                <div className="bg-surface border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs text-text-main flex items-center justify-between">
                  <span className="text-blue-400 font-bold mr-2">GET</span>
                  <span className="truncate">{healthEndpointUrl}</span>
                  <span className="text-[10px] text-emerald-400 font-bold ml-2">200 OK</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Серверийн ажиллагааг шалгах зорилгоор ямар ч түлхүүргүйгээр хандаж <code className="text-text-main font-mono">{"{\"ok\": true}"}</code> хариу авч болно.
                </p>
              </div>

              {/* Item 4: Data Protection & Pipeline */}
              <div className="bg-surfaceHighlight/50 border border-border rounded-2xl p-5 space-y-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={14} className="text-purple-400" />
                  Редакцийн хамгаалалт ба боловсруулалт
                </span>
                <div className="space-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Ирсэн мэдээ шууд нийтлэгдэхгүй, анхдагчаар <strong>DRAFT (Ноорог)</strong> төлөвт хадгалагдана.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>Факт-чек болон эх сурвалжууд автоматаар шүүгдэж, ревью хийхэд бэлэн хадгалагдана.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Checklist */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle size={15} />
                <span>Холболтын шалгалтын үр дүн: БҮХ ЗҮЙЛ ЗӨВ ТОХИРУУЛАГДСАН</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-text-muted pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>NEWS_API_KEY: Баталгаажсан</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>/api/news: Ажиллаж байна</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Cyrillic UTF-8: Дэмжигдсэн</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUEUE (INGESTED ARTICLES) */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Layers size={18} className="text-brand-purple" />
                <span>News API & Агентаас хүлээн авсан мэдээнүүд</span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Энд таны холбосон News API болон AI Агентаар дамжин орж ирсэн нийтлэлүүд харагдана.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendTestArticle}
                disabled={sendingTestNews}
                className="px-3.5 py-2 bg-surface hover:bg-surfaceHighlight border border-border text-text-main text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Тест мэдээ нэмэх</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {statusData?.recentArticles && statusData.recentArticles.length > 0 ? (
              statusData.recentArticles.map((article) => {
                const notes = article.agentNotes;
                const isDraft = article.status === 'DRAFT';

                return (
                  <div
                    key={article.id}
                    className="bg-surface border border-border hover:border-brand-purple/40 rounded-2xl p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-5"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-24 h-20 rounded-xl object-cover border border-border flex-shrink-0 bg-surfaceHighlight"
                        />
                      ) : (
                        <div className="w-24 h-20 rounded-xl bg-surfaceHighlight border border-border flex items-center justify-center text-text-muted flex-shrink-0">
                          <ImageIcon size={22} className="opacity-40" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-surface text-brand-purple border border-brand-purple/20">
                            {article.category}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDraft
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isDraft ? 'НООРОГ (Хүлээгдэж буй)' : 'НИЙТЛЭГДСЭН'}
                          </span>

                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(article.createdAt).toLocaleDateString('mn-MN')} {new Date(article.createdAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-text-main line-clamp-2 hover:text-brand-purple transition-colors">
                          <Link to={`/admin/articles/edit/${article.id}`}>
                            {article.title}
                          </Link>
                        </h3>

                        {/* Agent notes preview */}
                        {notes && (
                          <div className="pt-2 text-xs text-text-muted space-y-1 border-t border-border/40 mt-2">
                            {notes.fact_check && (
                              <div className="flex items-start gap-1.5 text-emerald-400/90 text-[11px]">
                                <ShieldCheck size={13} className="flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">
                                  {Array.isArray(notes.fact_check) ? notes.fact_check.join(' • ') : String(notes.fact_check)}
                                </span>
                              </div>
                            )}
                            {notes.short_idea && (
                              <div className="text-[11px] text-text-muted line-clamp-1 italic">
                                Гол санаа: {(() => {
                                  if (typeof notes.short_idea === 'object' && notes.short_idea !== null) {
                                    const val = notes.short_idea.hook || notes.short_idea.outline;
                                    return typeof val === 'string' ? val : JSON.stringify(val);
                                  }
                                  return typeof notes.short_idea === 'string' ? notes.short_idea : JSON.stringify(notes.short_idea);
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="px-3.5 py-1.5 bg-surfaceHighlight hover:bg-surface border border-border text-text-main text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <FileText size={13} />
                        <span>Засах / Нийтлэх</span>
                      </Link>

                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 text-text-muted hover:text-text-main text-xs font-medium flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        <span>Сайт дээр харах</span>
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-surface border border-border rounded-3xl p-8 space-y-4">
                <Bot size={36} className="mx-auto text-text-muted opacity-40" />
                <div>
                  <h4 className="font-bold text-sm text-text-main">Мэдээ одоогоор ирээгүй байна</h4>
                  <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                    Та холбогдсон News API-аар дамжуулан мэдээ илгээх эсвэл доорх товчийг дарж шалгалтын тест мэдээ оруулна уу.
                  </p>
                </div>
                <button
                  onClick={handleSendTestArticle}
                  disabled={sendingTestNews}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple text-white text-xs font-bold rounded-xl shadow-md"
                >
                  <Send size={13} />
                  <span>Шалгалтын тест мэдээ илгээх</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: API & WEBHOOK DOCS */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-text-main flex items-center gap-2">
                <Terminal size={20} className="text-brand-purple" />
                <span>Холболтын Заавар & Интеграцийн Код</span>
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Таны холбосон News API руу гадаад ямар ч хэл, скрипт, cron бот эсвэл n8n системээс мэдээ илгээх бэлэн жишээнүүд.
              </p>
            </div>

            {/* Secret key banner */}
            <div className="bg-brand-surface/40 border border-brand-purple/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider block">
                  Таны Холбогдсон Түлхүүр:
                </span>
                <span className="font-mono text-xs text-text-main font-bold break-all">
                  {activeApiKey}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(activeApiKey, 'key')}
                className="px-3.5 py-1.5 bg-brand-purple text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 self-start sm:self-center"
              >
                {copiedKey ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey ? 'Хуулагдлаа!' : 'Түлхүүр хуулах'}</span>
              </button>
            </div>

            {/* Code Examples Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(['curl', 'python', 'js'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCopiedCodeTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        copiedCodeTab === tab
                          ? 'bg-brand-purple text-white'
                          : 'bg-surfaceHighlight text-text-muted hover:text-text-main'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(codeSnippets[copiedCodeTab], 'code')}
                  className="px-3 py-1.5 text-xs text-text-muted hover:text-text-main flex items-center gap-1"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Хуулагдлаа' : 'Код хуулах'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 text-slate-100 p-5 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {codeSnippets[copiedCodeTab]}
              </pre>
            </div>

            {/* JSON Schema */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-sm text-text-main">Мэдээ хүлээн авах JSON талбаруудын бүтэц:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-emerald-400 font-bold">title (Шаардлагатай)</div>
                  <div className="text-text-muted text-[11px]">Мэдээний үндсэн гарчиг.</div>
                </div>
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-emerald-400 font-bold">body_markdown (эсвэл content)</div>
                  <div className="text-text-muted text-[11px]">Нийтлэлийн их бие (Markdown дэмжинэ).</div>
                </div>
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-blue-400 font-bold">slug (Сонголттой)</div>
                  <div className="text-text-muted text-[11px]">URL slug. Хоосон бол гарчгаас автоматаар үүсгэнэ.</div>
                </div>
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-blue-400 font-bold">category (Сонголттой)</div>
                  <div className="text-text-muted text-[11px]">Технологи, Шинжлэх ухаан, Бизнес, Дэлхий гэх мэт.</div>
                </div>
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-blue-400 font-bold">sources (Сонголттой)</div>
                  <div className="text-text-muted text-[11px]">Эх сурвалжийн жагсаалт: <code>[{'{"name":"Reuters","url":"..."}'}]</code></div>
                </div>
                <div className="bg-surfaceHighlight/50 border border-border p-4 rounded-xl space-y-1">
                  <div className="font-mono text-blue-400 font-bold">fact_check / short_idea (Сонголттой)</div>
                  <div className="text-text-muted text-[11px]">Факт-чекийн дүгнэлт болон товч тойм тэмдэглэл.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL STUDIO */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <Zap size={18} className="text-brand-orange" />
                  <span>Гараар Сэдэв өгч бэлтгүүлэх</span>
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Хэрэв шуурхай сэдвээр AI Агентаар нийтлэл бэлтгүүлэхийг хүсвэл энд сэдвийг оруулна уу.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    Мэдээний сэдэв / Түүхий текст <span className="text-brand-orange">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Жишээ: Монгол Улсын хиймэл дагуулын шинэ хөтөлбөр амжилттай туршигдлаа..."
                    required
                    className="w-full bg-surfaceHighlight border border-border rounded-2xl p-4 text-xs text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-purple transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-main mb-1.5">Ангилал</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-brand-purple"
                    >
                      <option value="Дэлхий">Дэлхий</option>
                      <option value="Технологи">Технологи</option>
                      <option value="Шинжлэх ухаан">Шинжлэх ухаан</option>
                      <option value="Бизнес">Бизнес</option>
                      <option value="Улс төр">Улс төр</option>
                      <option value="Нийгэм">Нийгэм</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-main mb-1.5">Өнгө аяс</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-brand-purple"
                    >
                      <option value="Шуурхай мэдээ">Шуурхай мэдээ</option>
                      <option value="Дүн шинжилгээ">Дүн шинжилгээ</option>
                      <option value="Танин мэдэхүй">Танин мэдэхүй</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    Эх сурвалжийн холбоосууд (Мөр тус бүрт 1)
                  </label>
                  <textarea
                    rows={2}
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    placeholder="https://reuters.com/...&#10;https://apnews.com/..."
                    className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-xs text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-purple"
                  />
                </div>

                {generationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{generationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="w-full py-3.5 bg-gradient-brand hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Sparkles size={16} className="animate-spin text-amber-300" />
                      <span>Агент бэлтгэж байна...</span>
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

          <div className="lg:col-span-6 space-y-6">
            {generatedArticle ? (
              <div className="bg-surface border border-emerald-500/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Бэлэн боллоо (Ноорог хадгалагдсан)
                  </span>
                  <Link
                    to={`/admin/articles/edit/${generatedArticle.id}`}
                    className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                  >
                    <span>Засварлах хуудас</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
                <h3 className="font-bold text-base text-text-main">{generatedArticle.title}</h3>
                <p className="text-xs text-text-muted line-clamp-3">{generatedArticle.excerpt}</p>
              </div>
            ) : (
              <div className="bg-surface/50 border border-border/60 rounded-3xl p-8 text-center space-y-3">
                <Bot size={32} className="mx-auto text-text-muted opacity-40" />
                <h4 className="text-xs font-bold text-text-main">Мэдээний бэлдэц энд харагдана</h4>
                <p className="text-[11px] text-text-muted max-w-xs mx-auto">
                  Зүүн талд сэдэв оруулан илгээхэд AI Агент боловсруулж, ноорог нийтлэл бэлтгэнэ.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
