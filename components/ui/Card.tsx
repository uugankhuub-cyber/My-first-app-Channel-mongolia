
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  variant?: 'default' | 'tinted';
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverEffect = true,
  variant = 'default',
  animate = true
}) => {
  
  const bgClasses = variant === 'tinted'
    ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10' 
    : 'bg-white dark:bg-surface border-slate-200/80 dark:border-white/10';

  const Component = animate ? motion.div : 'div';

  return (
    <Component 
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, margin: "-50px" } : undefined}
      whileHover={animate && hoverEffect ? { y: -8, transition: { duration: 0.3 } } : undefined}
      className={cn(
        bgClasses,
        "border rounded-2xl overflow-hidden transition-colors duration-300 ease-out",
        hoverEffect ? "hover:shadow-xl hover:border-brand-purple/20" : "shadow-sm dark:shadow-none",
        className
      )}
    >
      {children}
    </Component>
  );
};
