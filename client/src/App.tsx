import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNavigation } from "@/components/mobile-navigation";
import { TransactionProvider } from "@/contexts/transaction-context";
import { LoanProvider } from "@/contexts/loan-context";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Transactions from "@/pages/transactions";
import BankStatementPage from "@/pages/bank-statement";
import LoansPage from "@/pages/loans";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/loans" component={LoansPage} />
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
          <LoanProvider>
            <div className="min-h-screen bg-background pb-16 lg:pb-0">
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Router />
              </main>
              <MobileNavigation />
            </div>
            <Toaster />
          </LoanProvider>
        </TransactionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
