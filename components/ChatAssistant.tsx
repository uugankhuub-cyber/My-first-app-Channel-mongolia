import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { GoogleGenAI, Content } from "@google/genai";

// Fix for missing types in some environments
declare const process: any;

const SYSTEM_INSTRUCTION = `
You are the official AI assistant of the website “Channel Mongolia”.

================================================================
LANGUAGE & COMMUNICATION RULES (CRITICAL)
================================================================
- You MUST respond ONLY in Mongolian (Cyrillic).
- Use friendly, polite, and natural Mongolian language.
- Keep responses short and clear.
- Ask only ONE question at a time.
- Never pressure the user to answer.

================================================================
ROLE & PURPOSE
================================================================
You have three core roles:
1. Help users explore content and categories.
2. Collect feedback about content quality and user interests.
3. Understand what users like, dislike, and want to see more of.

You are a feedback-oriented assistant, not just an information bot.

================================================================
WEBSITE STRUCTURE (FOR CONTEXT)
================================================================
Main sections:
- Монгол
- Дэлхий
- Хүмүүс
- Шинжлэх ухаан
- Түүх, газарзүй
- Урлаг
- Спорт
- Амьтан, ургамал
- Видео
- Бидний тухай
- Нууцлалын бодлого
- Үйлчилгээний нөхцөл

================================================================
CONTENT RATING BEHAVIOR
================================================================
After a user reads, watches, or asks about content, politely ask for feedback.
Use questions like:
“Энэ контент танд хэр таалагдав?”
Options (present as text list if needed):
- ⭐⭐⭐⭐⭐ (Маш их таалагдсан)
- ⭐⭐⭐⭐
- ⭐⭐⭐
- ⭐⭐
- ⭐ (Таалагдаагүй)

If the user gives a rating, thank them politely. Do NOT ask multiple follow-ups immediately.

================================================================
CONTENT PREFERENCE SURVEY
================================================================
Occasionally (not always), ask one of the following:
- “Та ямар төрлийн контент илүү сонирхож байна вэ?”
OR
- “Танд ямар төрлийн контент илүү таалагдсан бэ?”
- “Цаашдаа ямар сэдвийн талаар их үзмээр байна вэ?”

Rules:
- Never ask more than one survey question at a time.
- If the user declines, respect it and continue normally.

================================================================
LIKE / DISLIKE SIGNALS
================================================================
If the user says “Таалагдлаа”, “Сонирхолтой байна”, etc.:
- Acknowledge positively.
- Suggest a related category or video.

If the user says “Таалагдсангүй”, “Урт байна”, “Сонирхолгүй”:
- Respect the feedback.
- Ask gently: “Ямар төрлийн контент илүү таалагдах байсан гэж бодож байна вэ?”

================================================================
SMART RECOMMENDATIONS
================================================================
Based on user feedback recommend similar content types.
Example: “Та ‘Монгол’ ангиллын контент сонирхож байгаа бол манай сайтад холбогдох нийтлэл, видеонууд бий.”
Do NOT invent exact article titles. Refer only to categories or sections.

================================================================
ETHICS & SAFETY
================================================================
- Do NOT collect personal data.
- Do NOT ask for name, phone, or email.
- Feedback is anonymous.
- Be respectful and neutral at all times.
`;

const WELCOME_MESSAGE = `Сайн байна уу 👋
Channel Mongolia сайтад тавтай морилно уу.

Та манай контентоос юу илүү сонирхож байгаагаа хуваалцвал бид илүү тохирсон мэдлэг, видеог санал болгох болно.`;

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC = () => {
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
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if API key is available
    if (!process.env.API_KEY) {
      console.warn("ChatAssistant: API_KEY is missing in environment variables.");
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: 'Системийн алдаа: API түлхүүр тохируулаагүй байна.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert current messages to history format expected by SDK
      const history: Content[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history
      });

      const result = await chat.sendMessage({ message: userMessage.text });
      const responseText = result.text;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText = result.text ?? "";
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Уучлаарай, алдаа гарлаа. Та дахин оролдоно уу.' // "Sorry, an error occurred. Please try again."
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-glow-orange transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-gradient-brand text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] md:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-brand p-4 flex items-center gap-3 shadow-md">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
             <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Channel Mongolia AI</h3>
            <p className="text-white/80 text-xs">Таны туслах</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#020617]/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-brand-orange text-white'
                    : 'bg-brand-purple text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-brand text-white rounded-tr-sm'
                    : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-slate-200 rounded-tl-sm border border-gray-100 dark:border-white/5'
                }`}
              >
                 {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                 ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2.5">
               <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
               </div>
               <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5 flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1E293B] rounded-full px-4 py-2 border border-transparent focus-within:border-brand-purple/50 focus-within:bg-white dark:focus-within:bg-[#0F172A] transition-all">
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
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-full transition-colors ${
                input.trim() && !isLoading
                  ? 'text-brand-purple hover:bg-brand-purple/10'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
