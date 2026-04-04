

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/5 p-1.5 shadow-lg shadow-primary/5 border border-primary/10">
                <img 
                    src="/logo.png" 
                    alt="Shosha Mart" 
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="ml-3 grid flex-1 text-left leading-tight">
                <span className="truncate font-[1000] text-base tracking-tighter uppercase italic text-primary">
                    Shosha Mart
                </span>
                <span className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 last:mb-0">
                    B2B Marketplace
                </span>
            </div>
        </>
    );
}
