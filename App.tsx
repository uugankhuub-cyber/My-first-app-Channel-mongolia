import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { DetailPage } from './pages/DetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { VideoPage } from './pages/VideoPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatAssistant } from './components/ChatAssistant';
import { GlobalInfoBar } from './components/GlobalInfoBar';
import { motion, AnimatePresence } from 'motion/react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Contexts
import { ContentProvider } from './context/ContentContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { AuthProvider } from './context/AuthContext';

// Admin Components
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminArticleForm } from './pages/admin/AdminArticleForm';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTagsPage } from './pages/admin/AdminTagsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminVideosPage } from './pages/admin/AdminVideosPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCommentsPage } from './pages/admin/AdminCommentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminNewsAgentPage } from './pages/admin/AdminNewsAgentPage';

import { CATEGORIES } from './constants';
import { testFirestoreConnection } from './lib/firebase';

const { BrowserRouter: Router, Routes, Route, useLocation, Navigate } = ReactRouterDOM;

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

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdminOrAuth = 
    location.pathname.startsWith('/admin') || 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password';

  if (isAdminOrAuth) {
    return (
      <Routes location={location}>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Unified Admin Panel */}
        <Route element={<ProtectedRoute roles={['ADMIN', 'EDITOR']} />}>
          <Route
            path="/admin"
            element={
              <ErrorBoundary fallbackTitle="Админ удирдлагын хэсэгт алдаа гарлаа">
                <AdminLayout />
              </ErrorBoundary>
            }
          >
             <Route index element={<AdminDashboard />} />
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="agent" element={<AdminNewsAgentPage />} />
             <Route path="articles" element={<AdminArticlesPage />} />
             <Route path="articles/create" element={<AdminArticleForm />} />
             <Route path="articles/edit/:id" element={<AdminArticleForm />} />
             <Route path="categories" element={<AdminCategoriesPage />} />
             <Route path="tags" element={<AdminTagsPage />} />
             <Route path="media" element={<AdminMediaPage />} />
             <Route path="videos" element={<AdminVideosPage />} />
             <Route path="users" element={<AdminUsersPage />} />
             <Route path="comments" element={<AdminCommentsPage />} />
             <Route path="analytics" element={<AdminAnalyticsPage />} />
             <Route path="settings" element={<AdminSettingsPage />} />
             <Route path="logs" element={<AdminLogs />} />
          </Route>
          <Route path="/admin/system/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <PublicLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            {/* Real article paths */}
            <Route path="/article/:id" element={<DetailPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* Backward compatibility for /news and /niitlel */}
            <Route path="/news" element={<Navigate to="/" replace />} />
            <Route path="/news/:id" element={<DetailPage />} />
            {CATEGORIES.filter(cat => cat.slug !== 'video').map(cat => (
               <Route key={cat.id} path={`/${cat.slug}`} element={<CategoriesPage categorySlug={cat.slug} />} />
            ))}
            <Route path="/video" element={<VideoPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/videos" element={<Navigate to="/video" replace />} />
            <Route path="/videos/:videoId" element={<VideoPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/niitlel/:id" element={<DetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bidnii-tukhai" element={<AboutPage />} />
            <Route path="/holboo-barikh" element={<ContactPage />} />
            <Route path="/nuuts-lalin-bodlogo" element={<Navigate to="/privacy" replace />} />
            <Route path="/uilchilgeenii-nukhtsul" element={<TermsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </PublicLayout>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    testFirestoreConnection();
    // Backward compatibility: gracefully migrate any #/ legacy hash paths to real paths
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
      const realPath = window.location.hash.replace(/^#/, '');
      window.history.replaceState(null, '', realPath);
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <UserPreferencesProvider>
            <ContentProvider>
              <AdminProvider>
                <SiteAppearanceManager />
                <Router>
                  <ScrollToTop />
                  <AnimatedRoutes />
                </Router>
              </AdminProvider>
            </ContentProvider>
          </UserPreferencesProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
