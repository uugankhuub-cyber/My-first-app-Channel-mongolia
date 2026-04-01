import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Container } from '../components/ui/Container';

export const TermsPage: React.FC = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container className="py-20 max-w-3xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-extrabold text-text-main mb-8 border-b border-border pb-6"
        >
          {t('terms_title')}
        </motion.h1>
        
        <motion.div 
          variants={itemVariants}
          className="prose prose-lg prose-slate dark:prose-invert max-w-none"
        >
          <section className="mt-8">
            <h3 className="text-text-main">1. Terms</h3>
            <p className="text-text-muted">
               By accessing the website at Channel Mongolia, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-text-main">2. Use License</h3>
            <p className="text-text-muted">
               Permission is granted to temporarily download one copy of the materials (information or software) on Channel Mongolia's website for personal, non-commercial transitory viewing only.
            </p>
          </section>
          
          <section className="mt-8">
            <h3 className="text-text-main">3. Disclaimer</h3>
            <p className="text-text-muted">
               The materials on Channel Mongolia's website are provided on an 'as is' basis. Channel Mongolia makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-text-main">4. Limitations</h3>
            <p className="text-text-muted">
               In no event shall Channel Mongolia or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Channel Mongolia's website.
            </p>
          </section>
        </motion.div>
      </motion.div>
    </Container>
  );
};
