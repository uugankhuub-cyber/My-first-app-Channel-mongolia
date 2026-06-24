
import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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
  animate = true,
  ...rest
}) => {
  
  const bgClasses = variant === 'tinted'
    ? 'bg-slate-900/5 dark:bg-white/5 border-slate-200 dark:border-white/10' 
    : 'bg-white dark:bg-surface border-slate-200/80 dark:border-white/10';

  const baseClasses = cn(
    bgClasses,
    "border rounded-2xl overflow-hidden transition-colors duration-300 ease-out",
    hoverEffect ? "hover:shadow-xl hover:border-brand-purple/20" : "shadow-sm dark:shadow-none",
    className
  );

  if (animate) {
    // Combine our motion props with any passed through rest, but typecast it.
    return (
      <motion.div 
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={hoverEffect ? { y: -8, transition: { duration: 0.3 } } : undefined}
        className={baseClasses}
        {...(rest as unknown as HTMLMotionProps<"div">)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={baseClasses}
      {...rest}
    >
      {children}
    </div>
  );
};
