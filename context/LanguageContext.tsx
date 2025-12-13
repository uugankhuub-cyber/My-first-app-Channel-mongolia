import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS } from '../constants';

type Language = 'mn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.mn) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('mn');

  const t = (key: keyof typeof TRANSLATIONS.mn) => {
    return TRANSLATIONS[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- ROUTER POLYFILL ---
// Simulates react-router-dom HashRouter since the package exports are missing in the environment.

const RouterContext = createContext<any>(null);
const RouteChildrenContext = createContext<any>(null);

export const HashRouter = ({ children }: any) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      let p = window.location.hash.slice(1);
      if (!p) p = '/';
      setPath(p);
    };
    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <RouterContext.Provider value={{ path }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(RouterContext);
  const fullPath = ctx?.path || '/';
  const [pathname, search] = fullPath.split('?');
  return { pathname, search: search ? `?${search}` : '' };
};

export const useNavigate = () => {
  return (to: string) => {
    window.location.hash = '#' + to;
  };
};

export const useParams = () => {
  const { pathname } = useLocation();
  // Simple regex matching for known params in this app
  const niitlelMatch = pathname.match(/\/niitlel\/([^/]+)/);
  if (niitlelMatch) return { id: niitlelMatch[1] };
  
  const editMatch = pathname.match(/\/content\/edit\/([^/]+)/);
  if (editMatch) return { id: editMatch[1] };

  return {};
};

export const useSearchParams = () => {
  const { search } = useLocation();
  return [new URLSearchParams(search)];
};

export const Link = ({ to, children, className, onClick, ...props }: any) => {
  return (
    <a 
      href={`#${to}`} 
      className={className} 
      onClick={(e) => {
        if (onClick) onClick(e);
      }} 
      {...props}
    >
      {children}
    </a>
  );
};

export const NavLink = Link; 

export const Routes = ({ children }: any) => {
  const { pathname } = useLocation();
  let match: React.ReactElement | null = null;
  
  React.Children.forEach(children, (child) => {
    if (match || !React.isValidElement(child)) return;
    const { path, index } = child.props as any;

    // Index route
    if (index && pathname === '/') {
      match = child;
      return;
    }

    // Wildcard
    if (path === '*') {
      match = child;
      return;
    }

    if (!path) return;

    // Exact match
    if (path === pathname) {
      match = child;
      return;
    }

    // Admin nested prefix (simplification for nested routing)
    if (path === '/admin' && pathname.startsWith('/admin')) {
      match = child;
      return;
    }

    // Dynamic segments (e.g. /:slug or /niitlel/:id)
    if (path.includes(':')) {
      const regexStr = '^' + path.replace(/:[a-zA-Z0-9_]+/g, '([^/]+)') + '$';
      if (new RegExp(regexStr).test(pathname)) {
        match = child;
        return;
      }
    }
  });

  if (match) {
    const { element, children: nestedChildren } = (match as any).props;
    return (
      <RouteChildrenContext.Provider value={nestedChildren}>
        {element}
      </RouteChildrenContext.Provider>
    );
  }

  return null;
};

export const Route = ({ element }: any) => element;

export const Outlet = () => {
  const nested = useContext(RouteChildrenContext);
  return <Routes>{nested}</Routes>;
};
