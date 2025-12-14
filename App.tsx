
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { DetailPage } from './pages/DetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ChatAssistant } from './components/ChatAssistant';
import { GlobalInfoBar } from './components/GlobalInfoBar';

// Contexts
import { ContentProvider } from './context/ContentContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';

// Admin Components
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminAISuggestions } from './pages/admin/AdminAISuggestions';
import { AdminEditor } from './pages/admin/AdminEditor';
import { AdminImages } from './pages/admin/AdminImages';
import { AdminChatSettings } from './pages/admin/AdminChatSettings';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminAppearance } from './pages/admin/AdminAppearance';
import { AdminMedia } from './pages/admin/AdminMedia';

import { CATEGORIES } from './constants';

const { HashRouter: Router, Routes, Route, useLocation } = ReactRouterDOM;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const SiteAppearanceManager: React.FC = () => {
  const { siteAppearance } = useAdmin();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cm-font-family', siteAppearance.fontFamily);
    root.style.setProperty('--cm-base-size', `${siteAppearance.baseFontSize}px`);
    root.style.setProperty('--cm-letter-spacing', `${siteAppearance.letterSpacing}px`);
    root.style.setProperty('--cm-line-height', `${siteAppearance.lineHeight}`);
  }, [siteAppearance]);
  return null;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div 
    className="min-h-screen font-sans flex flex-col relative bg-background text-text-main transition-colors duration-300"
    style={{ 
       fontFamily: 'var(--cm-font-family, Inter)', 
       fontSize: 'var(--cm-base-size, 16px)', 
       letterSpacing: 'var(--cm-letter-spacing, 0px)',
       lineHeight: 'var(--cm-line-height, 1.6)'
    }}
  >
    <GlobalInfoBar />
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
    <ChatAssistant />
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserPreferencesProvider>
          {/* ContentProvider wraps everything to provide data to both Public and Admin */}
          <ContentProvider>
            <AdminProvider>
              <SiteAppearanceManager />
              <Router>
                <ScrollToTop />
                <Routes>
                  <Route path="/admin" element={<AdminLayout />}>
                     <Route index element={<AdminDashboard />} />
                     <Route path="dashboard" element={<AdminDashboard />} />
                     <Route path="content" element={<AdminContent />} />
                     <Route path="images" element={<AdminImages />} />
                     <Route path="media" element={<AdminMedia />} />
                     <Route path="appearance" element={<AdminAppearance />} />
                     <Route path="ai-suggestions" element={<AdminAISuggestions />} />
                     <Route path="chat-settings" element={<AdminChatSettings />} />
                     <Route path="logs" element={<AdminLogs />} />
                     <Route path="content/edit/:id" element={<AdminEditor />} />
                     <Route path="settings" element={<div className="p-8 text-white">Settings Coming Soon...</div>} />
                  </Route>

                  <Route path="*" element={
                    <PublicLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        {CATEGORIES.map(cat => (
                           <Route key={cat.id} path={`/${cat.slug}`} element={<CategoriesPage categorySlug={cat.slug} />} />
                        ))}
                        <Route path="/video" element={<CategoriesPage filter="video" />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/niitlel/:id" element={<DetailPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/bidnii-tukhai" element={<AboutPage />} />
                        <Route path="/holboo-barikh" element={<ContactPage />} />
                        <Route path="/nuuts-lalin-bodlogo" element={<PrivacyPage />} />
                        <Route path="/uilchilgeenii-nukhtsul" element={<TermsPage />} />
                      </Routes>
                    </PublicLayout>
                  } />
                </Routes>
              </Router>
            </AdminProvider>
          </ContentProvider>
        </UserPreferencesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
