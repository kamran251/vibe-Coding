import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Company } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCompanies(params?: { search?: string; page?: string; limit?: string }) {
  const queryString = params 
    ? "?" + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined)).toString()
    : "";

  return useQuery({
    queryKey: [api.companies.list.path, params],
    queryFn: async () => {
      const res = await fetch(`${api.companies.list.path}${queryString}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      return api.companies.list.responses[200].parse(data);
    },
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: [api.companies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.companies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch company");
      const data = await res.json();
      return api.companies.get.responses[200].parse(data);
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useEnrichCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.companies.enrich.path, { id });
      const res = await fetch(url, {
        method: api.companies.enrich.method,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to enrich company. It may not exist or the service is down.");
      }
      const data = await res.json();
      return api.companies.enrich.responses[200].parse(data);
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData([api.companies.get.path, id], data);
      queryClient.invalidateQueries({ queryKey: [api.companies.list.path] });
      toast({
        title: "Enrichment Complete",
        description: `${data.name} has been successfully enriched.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrichment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
