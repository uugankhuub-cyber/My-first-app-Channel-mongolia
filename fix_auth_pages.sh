#!/bin/bash

# Fix LoginPage.tsx
sed -i 's/bg-slate-900\/50 backdrop-blur-xl border border-white\/10/bg-surface border border-border/g' pages/LoginPage.tsx
sed -i 's/text-white/text-text-main/g' pages/LoginPage.tsx
sed -i 's/text-slate-400/text-text-muted/g' pages/LoginPage.tsx
sed -i 's/text-slate-500/text-text-muted/g' pages/LoginPage.tsx
sed -i 's/bg-slate-800\/50 border border-white\/5/bg-surfaceHighlight border border-border/g' pages/LoginPage.tsx
# Re-fix the LogIn icon text color which should probably be white because it's inside bg-gradient-brand
sed -i 's/<LogIn className="text-text-main"/<LogIn className="text-white"/g' pages/LoginPage.tsx
sed -i 's/bg-gradient-brand text-text-main/bg-gradient-brand text-white/g' pages/LoginPage.tsx
sed -i 's/text-text-muted hover:text-text-main transition-colors">Нууц үг/text-text-muted hover:text-brand-purple transition-colors">Нууц үг/g' pages/LoginPage.tsx

# Fix RegisterPage.tsx
sed -i 's/bg-slate-900\/50 backdrop-blur-xl border border-white\/10/bg-surface border border-border/g' pages/RegisterPage.tsx
sed -i 's/text-white/text-text-main/g' pages/RegisterPage.tsx
sed -i 's/text-slate-400/text-text-muted/g' pages/RegisterPage.tsx
sed -i 's/text-slate-500/text-text-muted/g' pages/RegisterPage.tsx
sed -i 's/bg-slate-800\/50 border border-white\/5/bg-surfaceHighlight border border-border/g' pages/RegisterPage.tsx
# Re-fix icons inside gradient
sed -i 's/<UserPlus className="text-text-main"/<UserPlus className="text-white"/g' pages/RegisterPage.tsx
sed -i 's/bg-gradient-brand text-text-main/bg-gradient-brand text-white/g' pages/RegisterPage.tsx

# Fix ForgotPasswordPage.tsx (if it exists)
if [ -f pages/ForgotPasswordPage.tsx ]; then
  sed -i 's/bg-slate-900\/50 backdrop-blur-xl border border-white\/10/bg-surface border border-border/g' pages/ForgotPasswordPage.tsx
  sed -i 's/text-white/text-text-main/g' pages/ForgotPasswordPage.tsx
  sed -i 's/text-slate-400/text-text-muted/g' pages/ForgotPasswordPage.tsx
  sed -i 's/text-slate-500/text-text-muted/g' pages/ForgotPasswordPage.tsx
  sed -i 's/bg-slate-800\/50 border border-white\/5/bg-surfaceHighlight border border-border/g' pages/ForgotPasswordPage.tsx
  sed -i 's/bg-gradient-brand text-text-main/bg-gradient-brand text-white/g' pages/ForgotPasswordPage.tsx
  sed -i 's/<KeyRound className="text-text-main"/<KeyRound className="text-white"/g' pages/ForgotPasswordPage.tsx
fi
