import { format, isToday, isYesterday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@shared/schema";
import { useTransactions } from "@/contexts/transaction-context";
import { Link } from "wouter";

export function RecentTransactions() {
  const { recentTransactions, loading } = useTransactions();

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getAmountColor = (type: "income" | "expense") => {
    return type === "income" ? "text-secondary" : "text-destructive";
  };

  const getAmountPrefix = (type: "income" | "expense") => {
    return type === "income" ? "+" : "-";
  };

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "fas fa-question-circle";
  };

  const getCategoryColor = (type: "income" | "expense") => {
    return type === "income" ? "text-secondary" : "text-destructive";
  };

  if (loading) {
    return (
      <Card className="shadow-sm lg:col-span-2" data-testid="recent-transactions-loading">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm lg:col-span-2" data-testid="recent-transactions">
      <CardContent className="p-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid="link-view-all">
                View All
              </Button>
            </Link>
          </div>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="p-6 text-center" data-testid="empty-transactions">
            <div className="text-muted-foreground">
              <i className="fas fa-receipt text-4xl mb-4"></i>
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm">Add your first transaction using the form above</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-4 hover:bg-muted/50 transition-colors"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${transaction.type === "income" ? "bg-secondary/10" : "bg-destructive/10"} rounded-full flex items-center justify-center`}>
                      <i className={`${getCategoryIcon(transaction.category)} ${getCategoryColor(transaction.type)} text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`transaction-description-${transaction.id}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`transaction-category-${transaction.id}`}>
                        {CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getAmountColor(transaction.type)}`} data-testid={`transaction-amount-${transaction.id}`}>
                      {getAmountPrefix(transaction.type)}₨{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`transaction-date-${transaction.id}`}>
                      {formatTransactionDate(transaction.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
