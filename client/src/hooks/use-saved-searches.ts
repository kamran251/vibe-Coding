import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertSavedSearch } from "@shared/schema";

export function useSavedSearches() {
  return useQuery({
    queryKey: [api.savedSearches.list.path],
    queryFn: async () => {
      const res = await fetch(api.savedSearches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved searches");
      const data = await res.json();
      return api.savedSearches.list.responses[200].parse(data);
    },
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSavedSearch) => {
      const res = await fetch(api.savedSearches.create.path, {
        method: api.savedSearches.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save search");
      return api.savedSearches.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savedSearches.list.path] });
      toast({ title: "Search saved" });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.savedSearches.delete.path, { id });
      const res = await fetch(url, {
        method: api.savedSearches.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete saved search");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savedSearches.list.path] });
      toast({ title: "Saved search deleted" });
    },
  });
}
