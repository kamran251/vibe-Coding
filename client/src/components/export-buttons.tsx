import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Company } from "@shared/schema";

export function ExportMenu({ companies, listName }: { companies: Company[]; listName: string }) {
  const exportCSV = () => {
    const headers = ["ID", "Name", "URL", "Description", "Summary", "Last Enriched"];
    const rows = companies.map(c => [
      c.id.toString(),
      c.name,
      c.url || "",
      c.description || "",
      c.summary || "",
      c.lastEnrichedAt ? new Date(c.lastEnrichedAt).toISOString() : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    downloadFile(csvContent, `${listName}-export.csv`, "text/csv");
  };

  const exportJSON = () => {
    const jsonContent = JSON.stringify(companies, null, 2);
    downloadFile(jsonContent, `${listName}-export.json`, "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border/50 bg-card hover:bg-muted">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border/50">
        <DropdownMenuItem onClick={exportCSV} className="cursor-pointer hover:bg-primary/10 hover:text-primary">
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON} className="cursor-pointer hover:bg-primary/10 hover:text-primary">
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
