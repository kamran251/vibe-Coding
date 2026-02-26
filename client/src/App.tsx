import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import CompaniesPage from "./pages/companies";
import CompanyDetailPage from "./pages/company-detail";
import ListsPage from "./pages/lists";
import SavedSearchesPage from "./pages/saved-searches";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/companies" />
      </Route>
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/companies/:id" component={CompanyDetailPage} />
      <Route path="/lists" component={ListsPage} />
      <Route path="/saved-searches" component={SavedSearchesPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
