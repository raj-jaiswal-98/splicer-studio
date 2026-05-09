import React from 'react';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children,
  ...props 
}) => {
  const baseClass = "brutalist-button";
  const variantClass = variant === 'secondary' ? "secondary" : "";
  
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
