import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardProps = {
    children: ReactNode
    className?: string
    title?: string
}

export function Card({ children, className, title }: CardProps) {
    return (
        <div className={cn(
            "rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden group",
            "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none",
            "after:absolute after:-top-32 after:-right-32 after:w-64 after:h-64 after:bg-blue-500/10 after:rounded-full after:blur-3xl after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-700",
            className
        )}>
            {title && (
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 relative z-10">
                    {title}
                </h3>
            )}
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </div>
    )
}
