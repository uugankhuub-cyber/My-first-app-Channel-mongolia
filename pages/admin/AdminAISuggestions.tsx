import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Sparkles, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { useNavigate } from '../../context/LanguageContext';

export const AdminAISuggestions: React.FC = () => {
  const { aiSuggestions, generateDraftFromAI } = useAdmin();
  const navigate = useNavigate();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    try {
       const newDraft = await generateDraftFromAI(id);
       // Navigate to editor with the new draft
       navigate(`/admin/content/edit/${newDraft.id}`);
    } catch (e) {
       console.error(e);
       setGeneratingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="text-brand-purple" />
              AI Санал болгож буй сэдвүүд
           </h1>
           <p className="text-slate-400">Хэрэглэгчийн хандалт дээр үндэслэн AI систем дараах сэдвүүдийг санал болгож байна.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {aiSuggestions.map((suggestion) => (
           <div 
             key={suggestion.id} 
             className={`bg-[#1E293B] p-6 rounded-xl border transition-all ${
                suggestion.isUsed 
                  ? 'border-green-500/30 opacity-60' 
                  : 'border-white/5 hover:border-brand-purple/50 shadow-lg'
             }`}
           >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="px-3 py-1 bg-brand-surface rounded-full text-xs font-bold text-brand-purple border border-brand-purple/20">
                          {suggestion.suggestedCategory}
                       </span>
                       {suggestion.isUsed && (
                          <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                             <CheckCircle size={12} />
                             Ноорог үүссэн
                          </span>
                       )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{suggestion.topic}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-4">
                       " {suggestion.reason} "
                    </p>
                 </div>
                 
                 <div className="flex-shrink-0">
                    <button 
                       onClick={() => handleGenerate(suggestion.id)}
                       disabled={suggestion.isUsed || generatingId === suggestion.id}
                       className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                          suggestion.isUsed
                             ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                             : 'bg-white text-gray-900 hover:bg-brand-purple hover:text-white shadow-glow'
                       }`}
                    >
                       {generatingId === suggestion.id ? (
                          <>
                             <Loader size={18} className="animate-spin" />
                             Үүсгэж байна...
                          </>
                       ) : suggestion.isUsed ? (
                          <>
                             Ашигласан
                          </>
                       ) : (
                          <>
                             <Sparkles size={18} />
                             Ноорог үүсгэх
                             <ArrowRight size={16} />
                          </>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        ))}
        
        {aiSuggestions.length === 0 && (
           <div className="text-center py-20 text-slate-500">
              Одоогоор шинэ санал байхгүй байна.
           </div>
        )}
      </div>
    </div>
  );
};