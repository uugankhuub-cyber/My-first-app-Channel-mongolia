import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-white/10 transform -rotate-6 group hover:rotate-0 transition-all duration-500">
        <span className="text-primary-500 font-bold text-4xl drop-shadow-glow">CM</span>
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-100 mb-8 drop-shadow-lg">{t('nav_about')}</h1>
      
      <p className="text-xl text-slate-400 leading-relaxed mb-16 max-w-2xl mx-auto">
        {isEn 
          ? '"Channel Mongolia" is a digital platform dedicated to sharing knowledge simply and interestingly. We provide factual, sourced information on science, technology, history, and mysteries of the universe.'
          : '"Channel Mongolia" бол мэдлэгийг сонирхолтой, ойлгомжтой хэлбэрээр түгээх зорилготой цахим талбар юм. Бид шинжлэх ухаан, технологи, түүх, ертөнцийн нууц зэрэг сэдвүүдээр үнэн бодит, эх сурвалжтай мэдээллийг монгол хэл дээр бэлтгэн хүргэдэг.'
        }
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-8 bg-surface rounded-xl shadow-lg border border-white/5 hover:border-primary-500/30 hover:shadow-glow transition-all duration-300">
            <h3 className="font-bold text-lg text-slate-200 mb-3">
                {isEn ? 'Simple Explanation' : 'Энгийн тайлбар'}
            </h3>
            <p className="text-slate-500 leading-relaxed">
                {isEn ? 'We aim to explain even the most complex concepts in a way that anyone can understand.' : 'Хамгийн нарийн төвөгтэй ойлголтуудыг ч хэн бүхэнд ойлгомжтойгоор тайлбарлахыг зорьдог.'}
            </p>
        </div>
        <div className="p-8 bg-surface rounded-xl shadow-lg border border-white/5 hover:border-primary-500/30 hover:shadow-glow transition-all duration-300">
            <h3 className="font-bold text-lg text-slate-200 mb-3">
                {isEn ? 'Factual' : 'Үнэн бодит'}
            </h3>
            <p className="text-slate-500 leading-relaxed">
                {isEn ? 'Information based on scientific evidence and reliable sources.' : 'Шинжлэх ухааны нотолгоо, баталгаатай эх сурвалжид суурилсан мэдээлэл.'}
            </p>
        </div>
        <div className="p-8 bg-surface rounded-xl shadow-lg border border-white/5 hover:border-primary-500/30 hover:shadow-glow transition-all duration-300">
            <h3 className="font-bold text-lg text-slate-200 mb-3">
                {isEn ? 'Innovative' : 'Шинэлэг'}
            </h3>
            <p className="text-slate-500 leading-relaxed">
                {isEn ? 'Keeping up with new discoveries and interesting events worldwide.' : 'Дэлхий дахинд болж буй шинэ нээлт, сонирхолтой үйл явдлуудыг цаг алдалгүй.'}
            </p>
        </div>
      </div>
    </div>
  );
};