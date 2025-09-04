import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, CATEGORIES, CATEGORY_LABELS } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/contexts/transaction-context";
import { z } from "zod";

const formSchema = insertTransactionSchema.extend({
  date: z.string().min(1, "Date is required"),
  description: z.string().optional().default("")
});

type FormData = z.infer<typeof formSchema>;

export function QuickAddForm() {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const { addTransaction } = useTransactions();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await addTransaction({ ...data, type: transactionType });
      form.reset({
        type: transactionType,
        amount: 0,
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Success",
        description: `${transactionType === "income" ? "Income" : "Expense"} added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const categories = transactionType === "income" ? CATEGORIES.INCOME : CATEGORIES.EXPENSE;

  return (
    <Card className="shadow-sm" data-testid="quick-add-form">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Add</h3>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={() => setTransactionType("expense")}
              className={`flex-1 ${
                transactionType === "expense"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-transparent border border-border text-muted-foreground hover:bg-muted"
              }`}
              data-testid="button-expense-type"
            >
              Expense
            </Button>
            <Button
              type="button"
              onClick={() => setTransactionType("income")}
              className={`flex-1 ${
                transactionType === "income"
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "bg-transparent border border-border text-muted-foreground hover:bg-muted"
              }`}
              data-testid="button-income-type"
            >
              Income
            </Button>
          </div>

          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ₨
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                {...form.register("amount", { valueAsNumber: true })}
                data-testid="input-amount"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
              Category
            </Label>
            <Select onValueChange={(value) => form.setValue("category", value)}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </Label>
            <Input
              id="description"
              placeholder={transactionType === "income" ? "Source of income (optional)" : "What was this for?"}
              {...form.register("description")}
              data-testid="input-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              data-testid="input-date"
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={form.formState.isSubmitting}
            data-testid="button-add-transaction"
          >
            {form.formState.isSubmitting ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
