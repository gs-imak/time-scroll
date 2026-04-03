import { type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid';
}

export function Card({ className, variant = 'glass', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] p-4',
        variant === 'glass' ? 'glass' : 'bg-surface border border-border-subtle',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
