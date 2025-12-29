
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#0A63FF] text-white hover:bg-[#0052D1] shadow-sm',
    secondary: 'bg-white text-[#0B1220] border border-[#E6E8EB] hover:bg-[#F7F7F8]',
    ghost: 'bg-transparent text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#0B1220]',
    danger: 'bg-[#FF4D4F] text-white hover:bg-[#E64244]',
    success: 'bg-[#00B37E] text-white hover:bg-[#009468]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
