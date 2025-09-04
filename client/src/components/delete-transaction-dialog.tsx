import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Transaction, CATEGORY_LABELS } from "@shared/schema";
import { format } from "date-fns";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null;

  const getAmountColor = (type: "income" | "expense") => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  const getAmountPrefix = (type: "income" | "expense") => {
    return type === "income" ? "+" : "-";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
              <div className="font-medium mb-2">Transaction Details:</div>
              <div className="space-y-1">
                <div>
                  <strong>Type:</strong>{" "}
                  <span className={`capitalize ${getAmountColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </div>
                <div>
                  <strong>Amount:</strong>{" "}
                  <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}₨{transaction.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <strong>Category:</strong>{" "}
                  {CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS]}
                </div>
                <div>
                  <strong>Description:</strong> {transaction.description || "No description"}
                </div>
                <div>
                  <strong>Date:</strong> {format(new Date(transaction.date), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Yes, Delete Transaction"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
