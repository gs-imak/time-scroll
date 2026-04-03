import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 18, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]',
        'text-text-secondary hover:text-text-primary hover:bg-elevated/60',
        'transition-colors duration-150 cursor-pointer',
        className
      )}
      {...props}
    >
      <Icon size={size} />
    </button>
  )
);
IconButton.displayName = 'IconButton';
