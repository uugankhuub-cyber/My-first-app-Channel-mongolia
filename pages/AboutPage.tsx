
import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import { Container } from '../components/ui/Container';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { siteImages } = useAdmin();
  const isEn = language === 'en';

  // Use custom image or fallback default
  const aboutImage = siteImages['about_img'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container className="py-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div variants={itemVariants}>
          {aboutImage ? (
             <div className="mb-10 rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-lg aspect-video border-4 border-white dark:border-white/10">
                <img src={aboutImage} alt="About Us" className="w-full h-full object-cover" />
             </div>
          ) : (
             <motion.div 
               whileHover={{ rotate: 0, scale: 1.05 }}
               className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg dark:shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-border transform -rotate-6 transition-all duration-500"
             >
               <span className="text-brand-purple dark:text-primary-500 font-bold text-4xl drop-shadow-sm dark:drop-shadow-glow">CM</span>
             </motion.div>
          )}
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-extrabold text-text-main mb-8 drop-shadow-sm dark:drop-shadow-lg"
        >
          {t('nav_about')}
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-xl text-text-muted leading-relaxed mb-16 max-w-2xl mx-auto"
        >
          {isEn 
            ? '"Channel Mongolia" is a digital platform dedicated to sharing knowledge simply and interestingly. We provide factual, sourced information on science, technology, history, and mysteries of the universe.'
            : '"Channel Mongolia" бол мэдлэгийг сонирхолтой, ойлгомжтой хэлбэрээр түгээх зорилготой цахим талбар юм. Бид шинжлэх ухаан, технологи, түүх, ертөнцийн нууц зэрэг сэдвүүдээр үнэн бодит, эх сурвалжтай мэдээллийг монгол хэл дээр бэлтгэн хүргэдэг.'
          }
        </motion.p>

        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 bg-surface rounded-2xl shadow-lg border border-border hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300"
          >
              <h3 className="font-bold text-lg text-text-main mb-3">
                  {isEn ? 'Simple Explanation' : 'Энгийн тайлбар'}
              </h3>
              <p className="text-text-muted leading-relaxed text-sm">
                  {isEn ? 'We aim to explain even the most complex concepts in a way that anyone can understand.' : 'Хамгийн нарийн төвөгтэй ойлголтуудыг ч хэн бүхэнд ойлгомжтойгоор тайлбарлахыг зорьдог.'}
              </p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 bg-surface rounded-2xl shadow-lg border border-border hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300"
          >
              <h3 className="font-bold text-lg text-text-main mb-3">
                  {isEn ? 'Factual' : 'Үнэн бодит'}
              </h3>
              <p className="text-text-muted leading-relaxed text-sm">
                  {isEn ? 'Information based on scientific evidence and reliable sources.' : 'Шинжлэх ухааны нотолгоо, баталгаатай эх сурвалжид суурилсан мэдээлэл.'}
              </p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 bg-surface rounded-2xl shadow-lg border border-border hover:border-brand-purple/30 hover:shadow-xl transition-all duration-300"
          >
              <h3 className="font-bold text-lg text-text-main mb-3">
                  {isEn ? 'Innovative' : 'Шинэлэг'}
              </h3>
              <p className="text-text-muted leading-relaxed text-sm">
                  {isEn ? 'Keeping up with new discoveries and interesting events worldwide.' : 'Дэлхий дахинд болж буй шинэ нээлт, сонирхолтой үйл явдлуудыг цаг алдалгүй.'}
              </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </Container>
  );
};
