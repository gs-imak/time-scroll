import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 20, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center w-11 h-11 rounded-[var(--radius-md)]',
        'text-text-secondary hover:text-text-primary hover:bg-elevated/60',
        'transition-all duration-150 cursor-pointer',
        'hover:scale-105 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5a9aaa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c]',
        className
      )}
      {...props}
    >
      <Icon size={size} />
    </button>
  )
);
IconButton.displayName = 'IconButton';
