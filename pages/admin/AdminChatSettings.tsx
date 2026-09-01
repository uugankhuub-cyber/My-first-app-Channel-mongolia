import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Save, Bot, Plus, X } from 'lucide-react';

export const AdminChatSettings: React.FC = () => {
  const { chatSettings, updateChatSettings } = useAdmin();
  const [formData, setFormData] = useState(chatSettings);
  const [newQuestion, setNewQuestion] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateChatSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        suggestedQuestions: [...prev.suggestedQuestions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggestedQuestions: prev.suggestedQuestions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-text-main mb-2">Чатботын тохиргоо</h1>
           <p className="text-text-muted">AI туслахын зан төлөв болон санал болгох асуултуудыг удирдах</p>
        </div>
        <button 
           onClick={handleSave}
           className="flex items-center gap-2 px-6 py-2.5 bg-gradient-brand text-text-main rounded-xl font-bold hover:shadow-glow transition-all"
        >
           {saved ? 'Хадгалагдлаа!' : <><Save size={18} /> Хадгалах</>}
        </button>
      </div>

      <div className="space-y-8">
         {/* Personality */}
         <div className="bg-surface shadow-[var(--shadow-card)] p-6 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-4">
               <Bot className="text-brand-purple" size={24} />
               <h3 className="font-bold text-text-main text-lg">System Prompt (Зан төлөв)</h3>
            </div>
            <p className="text-sm text-text-muted mb-3">
               AI системд өөрийгөө хэн болох, яаж хариулахыг зааж өгөх зааварчилгаа.
            </p>
            <textarea 
               rows={4}
               value={formData.systemPrompt}
               onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
               className="w-full bg-[#0F172A] border border-border rounded-xl p-4 text-slate-200 outline-none focus:border-brand-purple transition-colors"
            />
         </div>

         {/* Suggested Questions */}
         <div className="bg-surface shadow-[var(--shadow-card)] p-6 rounded-xl border border-border">
            <h3 className="font-bold text-text-main text-lg mb-4">Санал болгох асуултууд</h3>
            <div className="space-y-3 mb-6">
               {formData.suggestedQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0F172A] px-4 py-3 rounded-lg border border-border">
                     <span className="text-text-main">{q}</span>
                     <button onClick={() => removeQuestion(idx)} className="text-text-muted hover:text-red-400">
                        <X size={18} />
                     </button>
                  </div>
               ))}
            </div>
            <div className="flex gap-3">
               <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Шинэ асуулт нэмэх..."
                  className="flex-1 bg-[#0F172A] border border-border rounded-xl px-4 py-2 text-text-main outline-none focus:border-brand-purple"
                  onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
               />
               <button 
                  onClick={addQuestion}
                  className="p-3 bg-surfaceHighlight hover:bg-white/10 text-text-main rounded-xl transition-colors"
               >
                  <Plus size={20} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};