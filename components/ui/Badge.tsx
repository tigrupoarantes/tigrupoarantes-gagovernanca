
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'in_progress' | 'in_review' | 'done' | 'late' | 'cancelled' | 'neutral' | 'priority-low' | 'priority-medium' | 'priority-high' | 'priority-critical';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles: Record<string, string> = {
    pending: 'bg-[#F7F7F8] text-[#6B7280]',
    in_progress: 'bg-[#E6F0FF] text-[#0A63FF]',
    in_review: 'bg-[#F0E6FF] text-[#722ED1]',
    done: 'bg-[#E6FAF2] text-[#00B37E]',
    late: 'bg-[#FFF2F0] text-[#FF4D4F]',
    cancelled: 'bg-gray-100 text-gray-400',
    neutral: 'bg-gray-100 text-gray-600',
    'priority-low': 'bg-gray-100 text-gray-500',
    'priority-medium': 'bg-blue-50 text-blue-600',
    'priority-high': 'bg-orange-50 text-orange-600',
    'priority-critical': 'bg-red-50 text-red-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  );
};
