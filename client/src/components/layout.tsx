import { Link, useLocation } from "wouter";
import { Building2, ListOrdered, Bookmark, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/lists", label: "My Lists", icon: ListOrdered },
    { href: "/saved-searches", label: "Saved Searches", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-border/50 bg-card/30 flex flex-col shrink-0 md:h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-foreground">Harmonic<span className="text-primary">.ai</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-2">Intelligence</div>
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-mono text-muted-foreground">
              VK
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">VC Partner</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
