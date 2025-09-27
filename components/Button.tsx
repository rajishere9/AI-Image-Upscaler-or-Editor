
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
    secondary: 'text-sky-300 bg-slate-700 hover:bg-slate-600 focus:ring-sky-500',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className || ''}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
