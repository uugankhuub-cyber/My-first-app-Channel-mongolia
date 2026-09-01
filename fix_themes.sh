#!/bin/bash

# Replace ProfilePage.tsx hardcoded colors
sed -i 's/bg-white dark:bg-slate-900/bg-surface/g' pages/ProfilePage.tsx
sed -i 's/bg-slate-50 dark:bg-white\/5/bg-surfaceHighlight/g' pages/ProfilePage.tsx
sed -i 's/border-slate-100 dark:border-white\/5/border-border/g' pages/ProfilePage.tsx
sed -i 's/text-slate-800 dark:text-slate-200/text-text-main/g' pages/ProfilePage.tsx
sed -i 's/text-slate-600 dark:text-slate-300/text-text-muted/g' pages/ProfilePage.tsx
sed -i 's/text-slate-500 dark:text-slate-400/text-text-muted/g' pages/ProfilePage.tsx
sed -i 's/bg-slate-100 dark:bg-slate-800/bg-surfaceHighlight/g' pages/ProfilePage.tsx

# Replace SearchPage.tsx
sed -i 's/bg-white\/50 dark:bg-white\/5/bg-surface/g' pages/SearchPage.tsx
sed -i 's/focus:bg-white dark:focus:bg-slate-900/focus:bg-surfaceHighlight/g' pages/SearchPage.tsx

# Replace CategoriesPage.tsx
sed -i 's/bg-white text-black shadow-lg/bg-text-main text-background shadow-lg/g' pages/CategoriesPage.tsx

# Replace Navbar.tsx
sed -i 's/bg-white\/90 dark:bg-background\/90/bg-background\/90/g' components/Navbar.tsx
sed -i 's/bg-white\/95 dark:bg-background\/95/bg-background\/95/g' components/Navbar.tsx
sed -i 's/bg-slate-100\/60 dark:bg-white\/5/bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/bg-slate-100\/50 dark:bg-white\/5/bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/border-slate-200\/50 dark:border-white\/10/border-border/g' components/Navbar.tsx
sed -i 's/border-slate-200\/80 dark:border-white\/5/border-border/g' components/Navbar.tsx
sed -i 's/text-slate-700 dark:text-slate-200/text-text-main/g' components/Navbar.tsx
sed -i 's/placeholder-slate-400 dark:placeholder-slate-500/placeholder-text-muted/g' components/Navbar.tsx
sed -i 's/placeholder-slate-400 dark:placeholder-slate-600/placeholder-text-muted/g' components/Navbar.tsx
sed -i 's/focus:bg-white dark:focus:bg-slate-900/focus:bg-background/g' components/Navbar.tsx
sed -i 's/text-slate-400 hover:text-slate-600 dark:hover:text-slate-300/text-text-muted hover:text-text-main/g' components/Navbar.tsx
sed -i 's/hover:bg-slate-200 dark:hover:bg-white\/10/hover:bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/text-slate-600 dark:text-slate-300/text-text-muted/g' components/Navbar.tsx
sed -i 's/bg-slate-100 dark:bg-white\/5/bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/border-slate-200 dark:border-white\/5/border-border/g' components/Navbar.tsx
sed -i 's/border-slate-200 dark:border-white\/10/border-border/g' components/Navbar.tsx
sed -i 's/bg-white dark:bg-background/bg-surface/g' components/Navbar.tsx
sed -i 's/text-slate-500 hover:text-slate-900 dark:hover:text-white/text-text-muted hover:text-text-main/g' components/Navbar.tsx
sed -i 's/hover:bg-slate-100 dark:hover:bg-white\/5/hover:bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/text-slate-700 dark:text-slate-300/text-text-muted/g' components/Navbar.tsx
sed -i 's/text-slate-600 dark:text-slate-400/text-text-muted/g' components/Navbar.tsx
sed -i 's/bg-slate-50\/50 dark:bg-white\/5/bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/border-slate-100 dark:border-white\/10/border-border/g' components/Navbar.tsx
sed -i 's/bg-white dark:bg-transparent/bg-surface/g' components/Navbar.tsx
sed -i 's/text-slate-500 dark:text-slate-400/text-text-muted/g' components/Navbar.tsx
sed -i 's/bg-white dark:bg-slate-800/bg-surfaceHighlight/g' components/Navbar.tsx
sed -i 's/text-slate-900 dark:text-white/text-text-main/g' components/Navbar.tsx
sed -i 's/hover:bg-slate-50 dark:hover:bg-white\/5/hover:bg-surfaceHighlight/g' components/Navbar.tsx

# Replace ChatAssistant.tsx
sed -i 's/bg-white dark:bg-\[#0F172A\]/bg-surface/g' components/ChatAssistant.tsx
sed -i 's/border-gray-200 dark:border-white\/10/border-border/g' components/ChatAssistant.tsx
sed -i 's/bg-white dark:bg-\[#1E293B\]/bg-surfaceHighlight/g' components/ChatAssistant.tsx
sed -i 's/text-gray-800 dark:text-slate-200/text-text-main/g' components/ChatAssistant.tsx
sed -i 's/border-gray-100 dark:border-white\/5/border-border/g' components/ChatAssistant.tsx
sed -i 's/bg-gray-100 dark:bg-\[#1E293B\]/bg-surfaceHighlight/g' components/ChatAssistant.tsx
sed -i 's/focus-within:bg-white dark:focus-within:bg-\[#0F172A\]/focus-within:bg-surface/g' components/ChatAssistant.tsx

# Replace GlobalInfoBar.tsx
sed -i 's/bg-white\/80 dark:bg-\[#1E293B\]\/80/bg-surface\/80/g' components/GlobalInfoBar.tsx
sed -i 's/border-slate-200 dark:border-white\/5/border-border/g' components/GlobalInfoBar.tsx
sed -i 's/bg-slate-300 dark:bg-white\/10/bg-border/g' components/GlobalInfoBar.tsx

