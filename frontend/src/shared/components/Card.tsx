import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

type CardVariant = 'glass' | 'glass-strong' | 'glass-light' | 'solid';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

// Maps each variant to its CSS class. glass/glass-strong/glass-light map
// directly to the .glass / .glass-strong / .glass-light classes in
// globals.css (see DESIGN_SYSTEM.md Glass Effects) — never re-implement
// glass inline here.
const VARIANT_CLASSES: Record<CardVariant, string> = {
  glass: 'glass',
  'glass-strong': 'glass-strong',
  'glass-light': 'glass-light',
  solid: 'bg-surface border border-border-subtle',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-[var(--radius-lg)] p-5', VARIANT_CLASSES[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';
