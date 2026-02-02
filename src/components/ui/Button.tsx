import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost'
}

export function Button({ className, variant = 'ghost', ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                variant === 'primary'
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white",
                className
            )}
            {...props}
        />
    )
}
