import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-accent to-accent-strong text-[#04170f] shadow-[0_10px_30px_-14px_rgba(16,185,129,0.9)] hover:brightness-110 hover:shadow-[0_14px_36px_-14px_rgba(16,185,129,0.95)]',
  secondary:
    'border border-line-strong bg-surface-raised text-fg hover:border-accent/40 hover:bg-surface-hover',
  ghost: 'text-muted hover:bg-white/[0.05] hover:text-fg',
  outline:
    'border border-accent/40 text-accent-soft hover:border-accent/70 hover:bg-accent/10',
  danger:
    'border border-danger/30 bg-danger/10 text-danger hover:border-danger/50 hover:bg-danger/15',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'size-10',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  )
})
