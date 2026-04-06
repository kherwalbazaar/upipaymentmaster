import * as React from 'react'

import { cn } from '@/lib/utils'

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
          showArrow ? 'pr-32' : 'px-3',
          className,
        )}
        {...props}
      />
      {showArrow && (
        <button
          type="button"
          onClick={onArrowClick}
          className="absolute right-[2px] top-[2px] bottom-[2px] cursor-pointer bg-white hover:bg-zinc-100 text-zinc-950 rounded-tr-md rounded-br-md px-3 font-black text-sm whitespace-nowrap transition-colors flex items-center justify-center"
        >
          ADD ITEM ➜
        </button>
      )}
    </div>
  )
}

export { Input }
