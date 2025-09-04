import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/contexts/transaction-context";
import { CATEGORY_LABELS, CATEGORIES, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction, loading } = useTransactions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === "all" || transaction.category === categoryFilter;
      const matchesType = !typeFilter || typeFilter === "all" || transaction.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, categoryFilter, typeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteTransaction = async (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const confirmDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTransaction.id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      setDeletingTransaction(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const getCategoryBadgeVariant = (type: "income" | "expense") => {
    return type === "income" ? "secondary" : "destructive";
  };

  const getAmountColor = (type: "income" | "expense") => {
    return type === "income" ? "text-secondary" : "text-destructive";
  };

  const getAmountPrefix = (type: "income" | "expense") => {
    return type === "income" ? "+" : "-";
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="transactions-loading">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allCategories = [...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE];

  console.log('Transactions loaded:', transactions.length);
  console.log('Filtered transactions:', filteredTransactions.length);

  return (
    <div className="space-y-6" data-testid="transactions">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
            data-testid="input-search"
          />
          <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="sm:w-48" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="sm:w-32" data-testid="select-type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden" data-testid="transactions-table">
        {filteredTransactions.length === 0 ? (
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground" data-testid="empty-transactions">
              <i className="fas fa-receipt text-4xl mb-4"></i>
              <p className="text-lg font-medium">
                {searchTerm || categoryFilter || typeFilter ? "No transactions found" : "No transactions yet"}
              </p>
              <p className="text-sm">
                {searchTerm || categoryFilter || typeFilter 
                  ? "Try adjusting your filters" 
                  : "Add your first transaction to get started"
                }
              </p>
            </div>
          </CardContent>
        ) : (
          <>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-muted/50 transition-colors"
                      data-testid={`transaction-row-${transaction.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge 
                          variant={getCategoryBadgeVariant(transaction.type)}
                          className="text-xs"
                        >
                          {CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}₨{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 border-blue-200 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-300"
                            data-testid={`button-edit-${transaction.id}`}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-600 border-red-200 hover:text-red-800 hover:bg-red-50 hover:border-red-300"
                            data-testid={`button-delete-${transaction.id}`}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-muted px-6 py-3 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-previous-page"
                  >
                    Previous
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        data-testid={`button-page-${pageNumber}`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onUpdate={updateTransaction}
      />

      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        onConfirm={confirmDeleteTransaction}
        isLoading={isDeleting}
      />
    </div>
  );
}
