import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useLists, useCreateList, useListItems, useRemoveFromList } from "@/hooks/use-lists";
import { ExportMenu } from "@/components/export-buttons";
import { Loader2, Plus, ListOrdered, FolderOpen, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

export default function ListsPage() {
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  const { data: lists, isLoading: isLoadingLists } = useLists();
  const { data: activeListItems, isLoading: isLoadingItems } = useListItems(activeListId || 0);
  
  const { mutate: createList, isPending: isCreating } = useCreateList();
  const { mutate: removeCompany } = useRemoveFromList();

  // Set first list active by default
  if (lists?.length && !activeListId) {
    setActiveListId(lists[0].id);
  }

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList(
      { name: newListName, description: newListDesc },
      { 
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewListName("");
          setNewListDesc("");
        } 
      }
    );
  };

  const activeList = lists?.find(l => l.id === activeListId);

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-screen flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Lists</h2>
            <p className="text-muted-foreground mt-1 text-sm">Organize and track your investment pipeline.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> New List
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateList} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input 
                    value={newListName} 
                    onChange={e => setNewListName(e.target.value)} 
                    placeholder="e.g. Q3 Fintech Prospects"
                    className="bg-background border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (optional)</label>
                  <Input 
                    value={newListDesc} 
                    onChange={e => setNewListDesc(e.target.value)} 
                    placeholder="European Series A focus..."
                    className="bg-background border-border/50"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!newListName.trim() || isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create List"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
          
          {/* Left Panel: List of Lists */}
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-border/50 bg-muted/10">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FolderOpen className="w-4 h-4" /> Collections
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingLists ? (
                <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : lists?.length === 0 ? (
                <div className="text-center p-6 text-sm text-muted-foreground">No lists created yet.</div>
              ) : (
                lists?.map(list => (
                  <button
                    key={list.id}
                    onClick={() => setActiveListId(list.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeListId === list.id 
                        ? "bg-primary/10 border border-primary/20 text-foreground shadow-sm" 
                        : "hover:bg-muted/50 border border-transparent text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      <ListOrdered className={`w-4 h-4 ${activeListId === list.id ? "text-primary" : ""}`} />
                      <span className="truncate">{list.name}</span>
                    </div>
                    {list.description && (
                      <p className="text-[11px] mt-1 truncate opacity-70 ml-6">{list.description}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: List Content */}
          <div className="md:col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden h-full">
            {activeList ? (
              <>
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/5">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{activeList.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Created {format(new Date(activeList.createdAt!), 'MMM dd, yyyy')} • {activeListItems?.length || 0} companies
                    </p>
                  </div>
                  {activeListItems && activeListItems.length > 0 && (
                    <ExportMenu companies={activeListItems} listName={activeList.name} />
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isLoadingItems ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : activeListItems?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-medium text-foreground">List is empty</p>
                      <p className="text-sm mt-1 max-w-sm">Go to the global registry to search and add companies to this pipeline.</p>
                      <Link href="/companies">
                        <Button variant="outline" className="mt-6 border-border/50">Explore Companies</Button>
                      </Link>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-mono sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Company</th>
                          <th className="px-6 py-3 font-semibold">Signals Focus</th>
                          <th className="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {activeListItems?.map(company => (
                          <tr key={company.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                                  <span className="font-semibold text-xs text-primary">{company.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div>
                                  <Link href={`/companies/${company.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block">
                                    {company.name}
                                  </Link>
                                  <div className="text-xs text-muted-foreground mt-0.5 max-w-[250px] truncate">
                                    {company.description || "No description"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {company.keywords?.slice(0, 2).map((kw, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border/50 font-mono">{kw}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/companies/${company.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeCompany({ listId: activeList.id, companyId: company.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a list to view its contents
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
