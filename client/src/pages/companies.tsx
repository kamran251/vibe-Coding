import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, Loader2, BookmarkPlus, ExternalLink, Activity } from "lucide-react";
import { useCompanies } from "@/hooks/use-companies";
import { useCreateSavedSearch } from "@/hooks/use-saved-searches";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: companies, isLoading } = useCompanies({ search: debouncedSearch });
  const { mutate: saveSearch, isPending: isSavingSearch } = useCreateSavedSearch();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveSearch = () => {
    if (!debouncedSearch) return;
    saveSearch({
      name: `Search: ${debouncedSearch}`,
      query: debouncedSearch,
      filters: {}
    });
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Global Registry</h2>
            <p className="text-muted-foreground mt-1 text-sm">Discover and analyze over 10M+ tech companies.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies, signals, keywords..." 
                className="pl-9 pr-12 bg-card border-border/50 focus-visible:ring-primary/30 h-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  /
                </kbd>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="shrink-0 gap-2 hover:bg-primary/10 hover:text-primary border-border/50"
              onClick={handleSaveSearch}
              disabled={!debouncedSearch || isSavingSearch}
            >
              <BookmarkPlus className="w-4 h-4" />
              Save Search
            </Button>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-mono border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Company</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Signals</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : companies?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No companies found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  companies?.map((company) => (
                    <tr key={company.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                            {company.logoUrl ? (
                              <img src={company.logoUrl} alt={company.name} className="w-6 h-6 object-contain rounded-sm" />
                            ) : (
                              <span className="font-semibold text-primary">{company.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <Link href={`/companies/${company.id}`} className="font-semibold text-foreground hover:text-primary hover:underline transition-colors text-base">
                              {company.name}
                            </Link>
                            {company.url && (
                              <a href={company.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5 w-fit">
                                {new URL(company.url).hostname} <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-muted-foreground line-clamp-2 max-w-md">{company.description || "No description available."}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {company.keywords?.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted border-border/50">{kw}</Badge>
                          ))}
                          {(company.keywords?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-transparent border-transparent text-muted-foreground">
                              +{(company.keywords?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top font-mono">
                        <div className="flex flex-col gap-1.5">
                          {company.derivedSignals?.slice(0, 2).map((sig, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-400">
                              <Activity className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{sig}</span>
                            </div>
                          ))}
                          {(!company.derivedSignals || company.derivedSignals.length === 0) && (
                            <span className="text-xs text-muted-foreground">No recent signals</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <Link href={`/companies/${company.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
                          Analyze
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
