import React from 'react';

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const BrutalInput: React.FC<BrutalInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>}
      <input 
        className={`brutalist-border ${className}`} 
        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        {...props} 
      />
    </div>
  );
};
