import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IssueStatus } from '../../types/api';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'next_up' | 'in_progress' | 'done' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const base = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700/60',
    next_up: 'bg-sky-950/60 text-sky-200 border border-sky-500/30',
    in_progress: 'bg-amber-950/60 text-amber-200 border border-amber-500/30',
    done: 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30',
    danger: 'bg-red-950/60 text-red-200 border border-red-500/30',
    info: 'bg-sky-950/60 text-sky-200 border border-sky-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IssueStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const statusLabels: Record<IssueStatus, string> = {
    next_up: 'Next Up',
    in_progress: 'In Progress',
    done: 'Done',
  };

  return (
    <Badge variant={status} size={size}>
      <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-indigo-400': status === 'next_up',
        'bg-amber-400': status === 'in_progress',
        'bg-emerald-400': status === 'done',
      })} />
      {statusLabels[status]}
    </Badge>
  );
};
