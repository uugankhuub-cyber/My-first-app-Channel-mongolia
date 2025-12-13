import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
       <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-8 border-b border-gray-200 dark:border-white/10 pb-6">{t('privacy_title')}</h1>
       
       <div className="prose prose-lg prose-slate dark:prose-invert">
          <p>Last updated: October 2025</p>
          
          <h3>1. Introduction</h3>
          <p>
             Channel Mongolia respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.
          </p>

          <h3>2. Data We Collect</h3>
          <p>
             We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul>
             <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
             <li><strong>Contact Data:</strong> includes email address.</li>
             <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
          </ul>

          <h3>3. How We Use Your Data</h3>
          <p>
             We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
             <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
             <li>Where it is necessary for our legitimate interests (or those of a third party).</li>
          </ul>

          <h3>4. Cookies</h3>
          <p>
             You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
          </p>
       </div>
    </div>
  );
};