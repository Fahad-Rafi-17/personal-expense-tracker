import { useState, useEffect } from "react";
import { useLoans } from "@/contexts/loan-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loan, InsertLoan, LoanPayment, InsertLoanPayment, LOAN_STATUS_COLORS, LOAN_STATUS_LABELS } from "@shared/schema";
import { format } from "date-fns";

export default function LoansPage() {
  const { 
    loans, 
    loading, 
    addLoan, 
    deleteLoan, 
    getLoanSummary,
    getLoanPayments,
    addLoanPayment,
    deleteLoanPayment 
  } = useLoans();
  const { toast } = useToast();
  const [summary, setSummary] = useState({
    totalLoansGiven: 0,
    totalLoansTaken: 0,
    activeLoansGiven: 0,
    activeLoansTaken: 0,
    totalOutstanding: 0,
    totalOwed: 0,
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertLoan>>({
    type: "given",
    amount: 0,
    remainingAmount: 0, // Will be set to match amount when amount is entered
    personName: "",
    personContact: "",
    description: "",
    dueDate: "",
    status: "active",
  });

  // Payment tracking states
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isViewingPayments, setIsViewingPayments] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await getLoanSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error("Failed to load loan summary:", error);
      }
    };

    loadSummary();
  }, [loans, getLoanSummary]);

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.amount || !formData.personName) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const loanData: InsertLoan = {
        type: formData.type as "given" | "taken",
        amount: Number(formData.amount),
        remainingAmount: Number(formData.amount), // Set remaining amount equal to amount initially
        personName: formData.personName!,
        personContact: formData.personContact || "",
        description: formData.description || "",
        interestRate: 0, // No interest rate functionality
        dueDate: formData.dueDate || undefined,
        status: formData.status as "active" | "completed" | "defaulted",
      };

      await addLoan(loanData);
      
      toast({
        title: "Success",
        description: "Loan added successfully",
      });

      setShowAddDialog(false);
      setFormData({
        type: "given",
        amount: 0,
        remainingAmount: 0, // Will be set to match amount when amount is entered
        personName: "",
        personContact: "",
        description: "",
        dueDate: "",
        status: "active",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add loan",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLoan = async (id: string, personName: string) => {
    if (window.confirm(`Are you sure you want to delete the loan for ${personName}?`)) {
      try {
        await deleteLoan(id);
        toast({
          title: "Success",
          description: "Loan deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete loan",
          variant: "destructive",
        });
      }
    }
  };

  // Payment handling functions
  const handleRecordPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentAmount('');
    setPaymentNotes('');
    setIsRecordingPayment(true);
  };

  const handleViewPayments = async (loan: Loan) => {
    try {
      setSelectedLoan(loan);
      const payments = await getLoanPayments(loan.id);
      setLoanPayments(payments);
      setIsViewingPayments(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    }
  };

  const handleAddPayment = async () => {
    if (!selectedLoan || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const paymentData: InsertLoanPayment = {
        loanId: selectedLoan.id,
        type: "payment",
        amount: Number(paymentAmount),
        description: paymentNotes || "",
        paymentDate: new Date().toISOString().split('T')[0],
      };

      await addLoanPayment(paymentData);
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setIsRecordingPayment(false);
      setPaymentAmount('');
      setPaymentNotes('');
      setSelectedLoan(null);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deleteLoanPayment(paymentId);
      
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });

      // Refresh the payments list
      if (selectedLoan) {
        const payments = await getLoanPayments(selectedLoan.id);
        setLoanPayments(payments);
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => `₨${amount.toFixed(2)}`;

  const getStatusBadge = (status: Loan["status"]) => (
    <Badge className={LOAN_STATUS_COLORS[status]}>
      {LOAN_STATUS_LABELS[status]}
    </Badge>
  );

  const loansGiven = loans.filter(loan => loan.type === "given");
  const loansTaken = loans.filter(loan => loan.type === "taken");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loans</h1>
          <p className="text-muted-foreground">Track money you've lent and borrowed</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <i className="fas fa-plus mr-2"></i>
              Add Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Loan</DialogTitle>
              <DialogDescription>
                Add a new loan record to track money lent or borrowed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as "given" | "taken" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="given">Money Lent</SelectItem>
                      <SelectItem value="taken">Money Borrowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₨)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount || ""}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        amount,
                        remainingAmount: prev.remainingAmount || amount
                      }));
                    }}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="personName">Person Name</Label>
                <Input
                  id="personName"
                  value={formData.personName || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="personContact">Contact (Optional)</Label>
                <Input
                  id="personContact"
                  value={formData.personContact || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, personContact: e.target.value }))}
                  placeholder="Phone or email"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Purpose of the loan..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Add Loan</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Money Owed to You</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalOutstanding)}</p>
              </div>
              <i className="fas fa-hand-holding-usd text-2xl text-green-600"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Money You Owe</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOwed)}</p>
              </div>
              <i className="fas fa-credit-card text-2xl text-red-600"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lent</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalLoansGiven)}</p>
              </div>
              <i className="fas fa-arrow-circle-up text-2xl text-blue-600"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Borrowed</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalLoansTaken)}</p>
              </div>
              <i className="fas fa-arrow-circle-down text-2xl text-orange-600"></i>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Tabs */}
      <Tabs defaultValue="given" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="given">Money Lent ({loansGiven.length})</TabsTrigger>
          <TabsTrigger value="taken">Money Borrowed ({loansTaken.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="given" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-hand-holding-usd text-green-600"></i>
                Money You've Lent
              </CardTitle>
              <CardDescription>
                Track money you've lent to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loansGiven.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-hand-holding-usd text-4xl mb-4 opacity-50"></i>
                  <p>No loans given yet</p>
                  <p className="text-sm">Start by adding a loan you've given to someone</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loansGiven.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{loan.personName}</div>
                            {loan.personContact && (
                              <div className="text-sm text-muted-foreground">{loan.personContact}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(loan.amount)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(loan.remainingAmount)}
                        </TableCell>
                        <TableCell>
                          {loan.dueDate ? format(new Date(loan.dueDate), "MMM dd, yyyy") : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecordPayment(loan)}
                              className="text-green-600 hover:text-green-700"
                              title="Record Payment"
                            >
                              <i className="fas fa-plus"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPayments(loan)}
                              className="text-blue-600 hover:text-blue-700"
                              title="View Payments"
                            >
                              <i className="fas fa-list"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLoan(loan.id, loan.personName)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taken" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-credit-card text-red-600"></i>
                Money You've Borrowed
              </CardTitle>
              <CardDescription>
                Track money you've borrowed from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loansTaken.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-credit-card text-4xl mb-4 opacity-50"></i>
                  <p>No loans taken yet</p>
                  <p className="text-sm">Add loans you've borrowed to track repayments</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lender</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loansTaken.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{loan.personName}</div>
                            {loan.personContact && (
                              <div className="text-sm text-muted-foreground">{loan.personContact}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(loan.amount)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(loan.remainingAmount)}
                        </TableCell>
                        <TableCell>
                          {loan.dueDate ? format(new Date(loan.dueDate), "MMM dd, yyyy") : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecordPayment(loan)}
                              className="text-green-600 hover:text-green-700"
                              title="Record Payment"
                            >
                              <i className="fas fa-plus"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPayments(loan)}
                              className="text-blue-600 hover:text-blue-700"
                              title="View Payments"
                            >
                              <i className="fas fa-list"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLoan(loan.id, loan.personName)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isRecordingPayment} onOpenChange={setIsRecordingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Recording payment for loan to/from <strong>{selectedLoan.personName}</strong></p>
                <p>Remaining amount: <strong>{formatCurrency(selectedLoan.remainingAmount)}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 border rounded-md"
                  step="0.01"
                  min="0"
                  max={selectedLoan.remainingAmount}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add any notes about this payment"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsRecordingPayment(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Payments Dialog */}
      <Dialog open={isViewingPayments} onOpenChange={setIsViewingPayments}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Payment history for loan to/from <strong>{selectedLoan.personName}</strong></p>
                <p>Original amount: <strong>{formatCurrency(selectedLoan.amount)}</strong></p>
                <p>Remaining amount: <strong>{formatCurrency(selectedLoan.remainingAmount)}</strong></p>
              </div>
              
              {loanPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <i className="fas fa-receipt text-4xl mb-4 opacity-50"></i>
                  <p>No payments recorded yet</p>
                  <p className="text-sm">Record payments to track loan progress</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{payment.description || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
