import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Container } from '../components/ui/Container';

export const PrivacyPage: React.FC = () => {
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
          {t('privacy_title')}
        </motion.h1>
        
        <motion.div 
          variants={itemVariants}
          className="prose prose-lg prose-slate dark:prose-invert max-w-none"
        >
          <p className="text-text-muted italic">Last updated: October 2025</p>
          
          <section className="mt-8">
            <h3 className="text-text-main">1. Introduction</h3>
            <p className="text-text-muted">
              Channel Mongolia respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-text-main">2. Data We Collect</h3>
            <p className="text-text-muted">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="text-text-muted">
              <li><strong className="text-text-main">Identity Data:</strong> includes username or similar identifier.</li>
              <li><strong className="text-text-main">Contact Data:</strong> includes email address.</li>
              <li><strong className="text-text-main">Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h3 className="text-text-main">3. How We Use Your Data</h3>
            <p className="text-text-muted">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="text-text-muted">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party).</li>
            </ul>
          </section>

          <section className="mt-8">
            <h3 className="text-text-main">4. Cookies</h3>
            <p className="text-text-muted">
              You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
            </p>
          </section>
        </motion.div>
      </motion.div>
    </Container>
  );
};
