import * as React from 'react'

import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface InputProps extends React.ComponentProps<'input'> {
  onArrowClick?: () => void
}

function Input({ className, type, onArrowClick, ...props }: InputProps) {
  const showArrow = onArrowClick

  return (
    <div className="relative">
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md rounded-r-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          '!border-white !border-2',
          showArrow ? 'pr-10' : 'px-3',
          className,
        )}
        {...props}
      />
      {showArrow && (
        <ArrowRight
          className="absolute right-0.5 top-1/2 h-15 w-15 -translate-y-1/2 cursor-pointer text-zinc-900 hover:text-zinc-700 bg-white rounded-tr-md rounded-br-md px-1 font-bold"
          onClick={onArrowClick}
        />
      )}
    </div>
  )
}

export { Input }
