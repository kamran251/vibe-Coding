import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useSavedSearches, useDeleteSavedSearch } from "@/hooks/use-saved-searches";
import { Bookmark, Search, Trash2, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function SavedSearchesPage() {
  const { data: searches, isLoading } = useSavedSearches();
  const { mutate: deleteSearch } = useDeleteSavedSearch();

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Saved Searches</h2>
          <p className="text-muted-foreground mt-1 text-sm">Quickly re-run your frequent queries and filters.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-xl bg-card border border-border/50" />
            ))}
          </div>
        ) : searches?.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No saved searches</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Save complex queries from the global registry to access them quickly here.</p>
            <Link href="/companies">
              <Button className="mt-6">Go to Registry</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {searches?.map(search => (
              <div key={search.id} className="glass-panel rounded-xl p-5 hover-card-effect relative group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground truncate max-w-[200px]">{search.name}</h3>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(search.createdAt!), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteSearch(search.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-border/50 mb-4 font-mono text-xs text-muted-foreground break-all">
                  <span className="text-primary mr-2">QUERY:</span> 
                  {search.query || "*"}
                </div>

                <div className="mt-auto">
                  <Link href={`/companies?search=${encodeURIComponent(search.query || '')}`}>
                    <Button className="w-full gap-2 bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground border border-border/50">
                      <Play className="w-4 h-4" /> Run Search
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
