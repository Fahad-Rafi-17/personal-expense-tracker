import { BankStatement } from "@/components/bank-statement";

export default function BankStatementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bank Statement</h2>
          <p className="text-muted-foreground">View your transactions in bank statement format</p>
        </div>
      </div>
      
      <BankStatement />
    </div>
  );
}
