import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[var(--velvet-accent)] focus-visible:ring-[var(--velvet-accent)]/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--velvet-accent)] text-[var(--velvet-text)] [a&]:hover:bg-[var(--velvet-accent-light)]',
        secondary:
          'border-transparent bg-[var(--velvet-card)] text-[var(--velvet-text)] border-[var(--velvet-border)] [a&]:hover:bg-[var(--velvet-accent)]/20',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-[var(--velvet-text)] border-[var(--velvet-border)] [a&]:hover:bg-[var(--velvet-accent)] [a&]:hover:text-[var(--velvet-text)]',
        new:
          'text-[var(--velvet-accent)] bg-[var(--velvet-accent)]/30 border-[var(--velvet-accent)]/30',
        beta:
          'text-blue-400 bg-blue-600/30 border-blue-600/30',
        highlight:
          'text-green-400 bg-green-600/30 border-green-600/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
