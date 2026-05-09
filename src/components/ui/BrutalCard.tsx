import React from 'react';

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const BrutalCard: React.FC<BrutalCardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`brutalist-card ${className}`} {...props}>
      {children}
    </div>
  );
};
