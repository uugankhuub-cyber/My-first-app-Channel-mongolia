import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
// ChatAssistant removed temporarily for production stability
// import { ChatAssistant } from './components/ChatAssistant';
import { GlobalInfoBar } from './components/GlobalInfoBar';

// Admin Imports
import { AdminProvider } from './context/AdminContext';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminAISuggestions } from './pages/admin/AdminAISuggestions';
import { AdminEditor } from './pages/admin/AdminEditor';

import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { CATEGORIES } from './constants';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout Wrapper for Public Pages to include Nav/Footer and GlobalInfoBar
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen font-sans flex flex-col relative">
    <GlobalInfoBar />
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    {/* ChatAssistant disabled
    <ChatAssistant />
    */}
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserPreferencesProvider>
          <AdminProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* ADMIN ROUTES */}
                <Route path="/admin" element={<AdminLayout />}>
                   <Route index element={<AdminDashboard />} />
                   <Route path="dashboard" element={<AdminDashboard />} />
                   <Route path="content" element={<AdminContent />} />
                   <Route path="ai-suggestions" element={<AdminAISuggestions />} />
                   <Route path="content/edit/:id" element={<AdminEditor />} />
                   <Route path="feedback" element={<div className="p-8 text-white">Санал хүсэлтийн хэсэг удахгүй нээгдэнэ...</div>} />
                   <Route path="settings" element={<div className="p-8 text-white">Тохиргоо хэсэг удахгүй нээгдэнэ...</div>} />
                </Route>

                {/* PUBLIC ROUTES */}
                <Route path="*" element={
                  <PublicLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      
                      {/* Dynamic Category Routes */}
                      {CATEGORIES.map(cat => (
                         <Route key={cat.id} path={`/${cat.slug}`} element={<CategoriesPage categorySlug={cat.slug} />} />
                      ))}
                      
                      <Route path="/video" element={<CategoriesPage filter="video" />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      
                      <Route path="/niitlel/:id" element={<DetailPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      
                      {/* Static Pages */}
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
        </UserPreferencesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
