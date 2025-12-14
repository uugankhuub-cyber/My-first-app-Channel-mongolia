
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  variant?: 'default' | 'tinted';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverEffect = true,
  variant = 'default'
}) => {
  
  const bgClasses = variant === 'tinted'
    ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10' // Tinted: Editorial grey in light mode
    : 'bg-white dark:bg-surface border-slate-200/80 dark:border-white/10'; // Default: Clean white

  return (
    <div 
      onClick={onClick}
      className={`
        ${bgClasses} border rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-md hover:-translate-y-1 hover:border-brand-purple/20' : 'shadow-sm dark:shadow-none'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
