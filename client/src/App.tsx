import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNavigation } from "@/components/mobile-navigation";
import { TransactionProvider } from "@/contexts/transaction-context";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Transactions from "@/pages/transactions";
import BankStatementPage from "@/pages/bank-statement";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/bank-statement" component={BankStatementPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TransactionProvider>
          <div className="min-h-screen bg-background pb-16 lg:pb-0">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Router />
            </main>
            <MobileNavigation />
          </div>
          <Toaster />
        </TransactionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
