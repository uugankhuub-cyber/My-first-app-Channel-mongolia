import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Image as ImageIcon, Upload, Search, Copy, Check, Trash2, 
  Link as LinkIcon, Plus, AlertCircle, RefreshCw, X, Folder, LayoutGrid, List 
} from 'lucide-react';
import { motion } from 'motion/react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  createdAt: string;
}

const DEFAULT_MEDIA: MediaItem[] = [
  { id: 'm-1', name: 'Digital Space Backdrop', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', size: '240 KB', createdAt: new Date().toLocaleDateString() },
  { id: 'm-2', name: 'AI Server Chip', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', size: '185 KB', createdAt: new Date().toLocaleDateString() },
  { id: 'm-3', name: 'Futuristic City Cyberpunk', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800', size: '320 KB', createdAt: new Date().toLocaleDateString() },
];

export const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('cm_admin_media');
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  });

  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);

  // Save to localStorage helper
  const saveMediaList = (list: MediaItem[]) => {
    setMediaList(list);
    localStorage.setItem('cm_admin_media', JSON.stringify(list));
  };

  // Handle Copy URL
  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Add Custom Image Link
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !nameInput) return;

    const newItem: MediaItem = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      name: nameInput,
      url: urlInput,
      size: `${Math.floor(Math.random() * 300) + 50} KB`,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newItem, ...mediaList];
    saveMediaList(updated);
    setUrlInput('');
    setNameInput('');
    setShowAddForm(false);
  };

  // Delete Media
  const handleDelete = (id: string) => {
    if (!window.confirm('Энэ медиа файлыг устгах уу?')) return;
    const filtered = mediaList.filter(item => item.id !== id);
    saveMediaList(filtered);
  };

  const filteredMedia = mediaList.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="text-brand-purple" />
            <span>Медиа сан (Media Library)</span>
          </h1>
          <p className="text-slate-400 text-sm">Нийтлэл болон сайтад ашиглагдах зураг, материалын нэгдсэн удирдлага</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-brand text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all self-start"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Хаах' : 'Зураг нэмэх'}
        </button>
      </div>

      {/* URL upload panel */}
      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#131B2E]/50 border border-white/10 rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <LinkIcon size={16} className="text-brand-purple" />
            <span>Интернэт холбоосоор зураг оруулах</span>
          </h3>

          <form onSubmit={handleAddMedia} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-slate-300 text-xs font-semibold">Зургийн нэр</label>
              <input 
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ж: Монгол бахархал"
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-slate-300 text-xs font-semibold">Зургийн холбоос (Image URL)</label>
              <input 
                type="text"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-brand-purple/50 transition-colors font-mono"
              />
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-bold rounded-xl transition-all h-[42px] flex items-center justify-center gap-1.5"
            >
              <Upload size={14} />
              Медиа санд нэмэх
            </button>
          </form>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="bg-[#131B2E]/50 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Файлын нэрээр хайх..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl text-white text-xs outline-none focus:border-brand-purple/50 transition-colors"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19]/80 border border-white/5 rounded-xl p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Сүлжээ харагдац"
          >
            <LayoutGrid size={14} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Жагсаалт харагдац"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* List Container */}
      {filteredMedia.length === 0 ? (
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl p-12 text-center space-y-2">
          <ImageIcon size={44} className="text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-md">Медиа файл олдсонгүй</h3>
          <p className="text-slate-400 text-xs">Хайлтын утгад тохирох зураг олдсонгүй.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div 
              key={item.id} 
              className="bg-[#131B2E]/30 border border-white/5 rounded-2xl overflow-hidden group hover:border-brand-purple/20 transition-all flex flex-col h-full"
            >
              {/* Image box */}
              <div className="aspect-video bg-slate-900/80 relative overflow-hidden flex-shrink-0">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleCopy(item.id, item.url)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="Холбоос хуулах"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Устгах"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Detail block */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <p className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                  <span>{item.size}</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-[#131B2E]/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0F19]/60 border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Файл</th>
                  <th className="p-4">Холбоос (URL)</th>
                  <th className="p-4">Хэмжээ</th>
                  <th className="p-4">Огноо</th>
                  <th className="p-4 pr-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-slate-500 select-all truncate max-w-[250px] block">
                        {item.url}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      {item.size}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      {item.createdAt}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button 
                          onClick={() => handleCopy(item.id, item.url)}
                          className="p-1.5 hover:bg-brand-purple/10 text-slate-400 hover:text-brand-purple rounded-lg transition-all"
                          title="Хуулах"
                        >
                          {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                          title="Устгах"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
