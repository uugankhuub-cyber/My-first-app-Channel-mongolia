
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = true }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-surface border border-border rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-card-hover hover:-translate-y-1 hover:border-brand-purple/20' : 'shadow-card'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
