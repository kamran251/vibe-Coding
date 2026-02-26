import { useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { useCompany, useEnrichCompany } from "@/hooks/use-companies";
import { useLists, useAddToList } from "@/hooks/use-lists";
import { useNotes, useCreateNote } from "@/hooks/use-notes";
import { Loader2, ExternalLink, Globe, Sparkles, Plus, Clock, MessageSquare, Briefcase, Activity, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function CompanyDetailPage() {
  const [, params] = useRoute("/companies/:id");
  const id = parseInt(params?.id || "0");
  const [noteContent, setNoteContent] = useState("");

  const { data: company, isLoading: isLoadingCompany } = useCompany(id);
  const { data: lists } = useLists();
  const { data: notes } = useNotes(id);
  
  const { mutate: enrich, isPending: isEnriching } = useEnrichCompany();
  const { mutate: addToList } = useAddToList();
  const { mutate: createNote, isPending: isCreatingNote } = useCreateNote();

  if (isLoadingCompany) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-mono text-sm animate-pulse">Loading intelligence...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="p-8 text-center text-muted-foreground">Company not found.</div>
      </Layout>
    );
  }

  const handleEnrich = () => enrich(id);
  
  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    createNote({ companyId: id, content: noteContent }, {
      onSuccess: () => setNoteContent("")
    });
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Hero Section */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border shadow-lg">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-10 h-10 object-contain rounded" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{company.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                {company.url && (
                  <a href={company.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline mt-1 font-mono">
                    <Globe className="w-3.5 h-3.5" />
                    {new URL(company.url).hostname}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border/50 bg-card hover:bg-muted">
                    <BookmarkPlus className="w-4 h-4" /> Save to List
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                  {lists?.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">No lists found</div>
                  ) : (
                    lists?.map(list => (
                      <DropdownMenuItem 
                        key={list.id} 
                        onClick={() => addToList({ listId: list.id, companyId: id })}
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        {list.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                onClick={handleEnrich} 
                disabled={isEnriching}
                className="gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.15)] transition-all"
              >
                {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isEnriching ? "Scanning Signals..." : "Deep Enrich"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview */}
            <section className="glass-panel p-6 rounded-2xl">
              <h3 className="flex items-center gap-2 font-semibold text-lg border-b border-border/50 pb-3 mb-4">
                <Briefcase className="w-5 h-5 text-primary" /> Profile Overview
              </h3>
              <p className="text-foreground/90 leading-relaxed">
                {company.description || "No general description available. Try running an enrichment scan."}
              </p>
              
              {company.summary && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm leading-relaxed text-foreground/80">
                  <span className="font-semibold text-primary block mb-1">AI Synthesis</span>
                  {company.summary}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {company.keywords?.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="bg-muted border-border/50 text-xs font-mono">{kw}</Badge>
                ))}
              </div>
            </section>

            {/* What they do & Derived Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="glass-panel p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b border-border/50 pb-3 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" /> Derived Signals
                </h3>
                {company.derivedSignals && company.derivedSignals.length > 0 ? (
                  <ul className="space-y-3">
                    {company.derivedSignals.map((sig, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{sig}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No signals identified.</p>
                )}
              </section>

              <section className="glass-panel p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b border-border/50 pb-3 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Products & Services
                </h3>
                {company.whatTheyDo && company.whatTheyDo.length > 0 ? (
                  <ul className="space-y-3 list-disc list-inside px-2 text-sm text-muted-foreground">
                    {company.whatTheyDo.map((item, i) => (
                      <li key={i} className="leading-snug pl-1">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Product data unavailable.</p>
                )}
              </section>
            </div>
            
            {/* Source Citations */}
            {company.sources && company.sources.length > 0 && (
              <section className="glass-panel p-6 rounded-2xl">
                <h3 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Data Sources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.sources.map((src, i) => (
                    <a key={i} href={src.url} target="_blank" rel="noreferrer" className="flex flex-col p-3 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors">
                      <span className="text-xs text-primary truncate">{src.url}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(src.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Notes */}
          <div className="space-y-6">
            <section className="glass-panel p-6 rounded-2xl flex flex-col h-[600px] sticky top-6">
              <h3 className="flex items-center gap-2 font-semibold text-lg border-b border-border/50 pb-3 mb-4 shrink-0">
                <MessageSquare className="w-5 h-5 text-indigo-400" /> Internal Notes
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {notes?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl p-6">
                    No notes yet. Add your insights below.
                  </div>
                ) : (
                  notes?.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 relative group hover:border-primary/20 transition-colors">
                      <div className="text-sm whitespace-pre-wrap text-foreground/90">{note.content}</div>
                      <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(note.createdAt!), 'MMM dd, HH:mm')}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">VK</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 pt-4 border-t border-border/50 space-y-3">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Capture thesis, sync notes, updates..."
                  className="w-full h-24 rounded-lg bg-card border border-border/50 p-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none font-sans placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAddNote();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">cmd + enter to submit</span>
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!noteContent.trim() || isCreatingNote}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isCreatingNote ? "Saving..." : "Add Note"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
