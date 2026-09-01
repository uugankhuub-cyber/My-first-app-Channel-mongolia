
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
    ? 'bg-surfaceHighlight border-border' 
    : 'bg-surface border-border';

  const baseClasses = cn(
    bgClasses,
    "border rounded-[14px] overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300 ease-out",
    hoverEffect ? "hover:shadow-[var(--shadow-hover)] hover:border-brand-purple hover:-translate-y-[3px]" : "",
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
