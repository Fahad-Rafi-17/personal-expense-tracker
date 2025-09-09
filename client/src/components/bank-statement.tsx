import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { get, handleApiResponse } from "@/lib/api";
import { Transaction } from "@shared/schema";

interface BankStatementEntry {
  date: string;
  description: string;
  withdrawals: string;
  deposits: string;
  balance: string;
}

export function BankStatement() {
  const [statements, setStatements] = useState<BankStatementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const { toast } = useToast();

  const fetchStatements = async () => {
    try {
      const response = await get('/api/transactions');
      const transactions = await handleApiResponse<Transaction[]>(response);
      
      // Convert to bank statement format
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let runningBalance = 0;
      const statementEntries = sortedTransactions.map(transaction => {
        const amount = Number(transaction.amount);
        const isIncome = transaction.type === "income";
        
        runningBalance += isIncome ? amount : -amount;
        
        return {
          date: new Date(transaction.date).toLocaleDateString('en-US'),
          description: transaction.description || transaction.category,
          withdrawals: isIncome ? "" : amount.toFixed(2),
          deposits: isIncome ? amount.toFixed(2) : "",
          balance: runningBalance.toFixed(2)
        };
      });

      setStatements(statementEntries);
      setCurrentBalance(runningBalance);
    } catch (error) {
      console.error("Failed to fetch statements:", error);
      toast({
        title: "Error",
        description: "Failed to load bank statements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await get('/api/transactions/download/csv', {
        headers: {
          'Content-Type': 'text/csv'
        }
      });
      
      if (!response.ok) throw new Error('Failed to download CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to download CSV:", error);
      toast({
        title: "Error",
        description: "Failed to download CSV file",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bank Statement View</CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant={currentBalance >= 0 ? "secondary" : "destructive"} className="text-lg py-1 px-3">
              Balance: ₨{Math.abs(currentBalance).toFixed(2)} {currentBalance < 0 ? "(Debit)" : ""}
            </Badge>
            <Button onClick={downloadCSV} variant="outline" size="sm">
              <i className="fas fa-download mr-2"></i>
              Download CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {statements.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <i className="fas fa-file-csv text-4xl mb-4"></i>
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-sm">Add your first transaction to see it here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Withdrawals
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Deposits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {statements.map((entry, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entry.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {entry.withdrawals && (
                        <span className="text-destructive font-medium">
                          ₨{entry.withdrawals}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {entry.deposits && (
                        <span className="text-secondary font-medium">
                          ₨{entry.deposits}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={Number(entry.balance) >= 0 ? "text-secondary" : "text-destructive"}>
                        ₨{Math.abs(Number(entry.balance)).toFixed(2)}
                        {Number(entry.balance) < 0 && " (DR)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
