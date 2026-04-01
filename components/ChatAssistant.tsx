import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext'; // Access config directly since context is available in PublicLayout
import { cn } from '../lib/utils';

const WELCOME_MESSAGE = `Сайн байна уу 👋
Channel Mongolia сайтад тавтай морилно уу.

Та манай контентоос юу илүү сонирхож байгаагаа хуваалцвал бид илүү тохирсон мэдлэг, видеог санал болгох болно.`;

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC = () => {
  const { chatSettings } = useAdmin(); // Get config from context
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Send history + system instruction (config)
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            text: m.text
          })),
          systemInstruction: chatSettings.systemPrompt // Passed from admin config
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text || 'Уучлаарай, хариулт авахад алдаа гарлаа.'
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Уучлаарай, системд алдаа гарлаа. Та дахин оролдоно уу.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-glow-orange transition-all duration-300",
          isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-gradient-brand text-white'
        )}
        aria-label="Open Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[90vw] md:w-96 h-[600px] max-h-[75vh] bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-brand p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles size={16} className="text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-sm">Channel Mongolia AI</h3>
                   <p className="text-white/80 text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                   </p>
                 </div>
              </div>
              <button 
                 onClick={() => setMessages([{ id: 'init', role: 'model', text: WELCOME_MESSAGE }])} 
                 className="text-white/60 hover:text-white transition-colors"
                 title="Restart Chat"
              >
                 <RefreshCw size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#020617]/50 scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex items-start gap-2.5",
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                        msg.role === 'user' ? 'bg-brand-orange text-white' : 'bg-brand-purple text-white'
                      )}
                    >
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.role === 'user'
                          ? 'bg-gradient-brand text-white rounded-tr-sm'
                          : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-slate-200 rounded-tl-sm border border-gray-100 dark:border-white/5'
                      )}
                    >
                       {msg.text.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                       ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                   <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot size={14} />
                   </div>
                   <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5 flex gap-1 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                   </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (Chips) */}
            <AnimatePresence>
              {!isLoading && messages.length < 5 && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 pb-2 bg-gray-50 dark:bg-[#020617]/50 overflow-x-auto no-scrollbar flex gap-2"
                 >
                    {chatSettings.suggestedQuestions.map((q, idx) => (
                       <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSend(q)}
                          className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-[#1E293B] border border-brand-purple/20 rounded-full text-xs text-brand-purple dark:text-primary-300 whitespace-nowrap hover:bg-brand-purple hover:text-white transition-colors shadow-sm"
                       >
                          {q}
                       </motion.button>
                    ))}
                 </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1E293B] rounded-full px-4 py-2 border border-transparent focus-within:border-brand-purple/50 focus-within:bg-white dark:focus-within:bg-[#0F172A] transition-all shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Хайх зүйлээ бичнэ үү..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-slate-100 placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-2 rounded-full transition-colors transform",
                    input.trim() && !isLoading
                      ? 'text-brand-purple hover:bg-brand-purple/10 hover:scale-110 active:scale-95'
                      : 'text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
