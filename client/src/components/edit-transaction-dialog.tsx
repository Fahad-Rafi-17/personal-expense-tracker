import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction, CATEGORIES, CATEGORY_LABELS, InsertTransaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<InsertTransaction>) => Promise<Transaction | null>;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onUpdate,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InsertTransaction>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type || !formData.amount || !formData.category || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!transaction) return;

    setIsLoading(true);
    try {
      await onUpdate(transaction.id, formData);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      onOpenChange(false);
      setShowConfirmation(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setShowConfirmation(false);
    // Reset form to original values
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      });
    }
  };

  const getAvailableCategories = () => {
    return formData.type === "income" ? CATEGORIES.INCOME : CATEGORIES.EXPENSE;
  };

  if (!transaction) return null;

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value: "income" | "expense") => {
                    setFormData(prev => ({
                      ...prev,
                      type: value,
                      category: "", // Reset category when type changes
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₨) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, category: value }))
                }
                disabled={!formData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                }
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this transaction? This action cannot be undone.
              <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                <div className="font-medium mb-2">Transaction Details:</div>
                <div><strong>Type:</strong> {formData.type}</div>
                <div><strong>Amount:</strong> ₨{formData.amount?.toFixed(2)}</div>
                <div><strong>Category:</strong> {CATEGORY_LABELS[formData.category as keyof typeof CATEGORY_LABELS]}</div>
                <div><strong>Description:</strong> {formData.description || "No description"}</div>
                <div><strong>Date:</strong> {formData.date && format(new Date(formData.date), "MMM d, yyyy")}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpdate}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Updating..." : "Yes, Update Transaction"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
