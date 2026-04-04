import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
    className?: string
}

export function Pagination({ links, className }: PaginationProps) {
    if (links.length <= 3) return null

    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-1 mt-8 mb-4", className)}>
            {links.map((link, index) => {
                const isPrev = index === 0
                const isNext = index === links.length - 1
                const label = isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label

                // Skip "..." if it's more than just a label
                if (link.label === "...") {
                    return (
                        <div key={index} className="px-3 py-2 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </div>
                    )
                }

                return (
                    <Button
                        key={index}
                        asChild
                        variant={link.active ? "default" : "outline"}
                        size={isPrev || isNext ? "icon" : "sm"}
                        className={cn(
                            "rounded-full h-10 min-w-[40px] font-black uppercase tracking-widest border-2 transition-all hover:scale-105",
                            link.active ? "shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground",
                            !link.url && "opacity-50 pointer-events-none"
                        )}
                    >
                        <Link
                            href={link.url || "#"}
                            preserveScroll
                            className="flex items-center justify-center"
                        >
                            {label}
                        </Link>
                    </Button>
                )
            })}
        </div>
    )
}

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchInput({ value, onChange, placeholder = "Search...", className }: SearchInputProps) {
    return (
        <div className={cn("relative group max-w-sm w-full", className)}>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 pl-12 pr-4 rounded-full bg-muted/20 border-2 border-input focus:border-primary/50 focus:bg-background/80 transition-all outline-none font-bold uppercase tracking-widest text-xs placeholder:text-muted-foreground/40 shadow-sm"
            />
        </div>
    )
}
