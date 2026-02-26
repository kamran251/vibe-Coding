import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertList } from "@shared/schema";

export function useLists() {
  return useQuery({
    queryKey: [api.lists.list.path],
    queryFn: async () => {
      const res = await fetch(api.lists.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch lists");
      const data = await res.json();
      return api.lists.list.responses[200].parse(data);
    },
  });
}

export function useListItems(listId: number) {
  return useQuery({
    queryKey: [api.lists.getItems.path, listId],
    queryFn: async () => {
      const url = buildUrl(api.lists.getItems.path, { id: listId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch list items");
      const data = await res.json();
      return api.lists.getItems.responses[200].parse(data);
    },
    enabled: !!listId && !isNaN(listId),
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertList) => {
      const res = await fetch(api.lists.create.path, {
        method: api.lists.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create list");
      return api.lists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lists.list.path] });
      toast({ title: "List created successfully" });
    },
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, companyId }: { listId: number; companyId: number }) => {
      const url = buildUrl(api.lists.addCompany.path, { id: listId });
      const res = await fetch(url, {
        method: api.lists.addCompany.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add company to list");
      return api.lists.addCompany.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.lists.getItems.path, variables.listId] });
      toast({ title: "Added to list" });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, companyId }: { listId: number; companyId: number }) => {
      const url = buildUrl(api.lists.removeCompany.path, { id: listId, companyId });
      const res = await fetch(url, {
        method: api.lists.removeCompany.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove from list");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.lists.getItems.path, variables.listId] });
      toast({ title: "Removed from list" });
    },
  });
}
