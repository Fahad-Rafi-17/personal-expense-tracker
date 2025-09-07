import { StatCard } from "@/components/stat-card";
import { QuickAddForm } from "@/components/quick-add-form";
import { RecentTransactions } from "@/components/recent-transactions";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import { useTransactions } from "@/contexts/transaction-context";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { totalBalance, monthlyIncome, monthlyExpenses, previousMonthIncome, previousMonthExpenses, loading } = useTransactions();

  const savingsTarget = 1000; // You could make this configurable
  const savings = monthlyIncome - monthlyExpenses;
  const savingsProgress = Math.max(0, Math.min(100, (savings / savingsTarget) * 100));

  // Calculate actual trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0 && current === 0) {
      return undefined; // No trend when both are zero
    }
    if (previous === 0) {
      return { value: "New", isPositive: true, label: "this month" };
    }
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      isPositive,
      label: "from last month"
    };
  };

  const balanceTrend = calculateTrend(totalBalance, (previousMonthIncome - previousMonthExpenses));
  const incomeTrend = calculateTrend(monthlyIncome, previousMonthIncome);
  const expensesTrend = calculateTrend(monthlyExpenses, previousMonthExpenses);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`₨${totalBalance.toFixed(2)}`}
          icon={<i className="fas fa-wallet text-secondary"></i>}
          trend={balanceTrend}
        />
        
        <StatCard
          title="This Month Income"
          value={`₨${monthlyIncome.toFixed(2)}`}
          icon={<i className="fas fa-arrow-down text-secondary"></i>}
          trend={incomeTrend}
        />
        
        <StatCard
          title="This Month Expenses"
          value={`₨${monthlyExpenses.toFixed(2)}`}
          icon={<i className="fas fa-arrow-up text-destructive"></i>}
          trend={expensesTrend}
        />
        
        <StatCard
          title="Savings Goal"
          value={`${savingsProgress.toFixed(0)}%`}
          icon={<i className="fas fa-target text-accent"></i>}
          progress={savingsProgress}
        />
      </div>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickAddForm />
        </div>
        <RecentTransactions />
      </div>

      {/* Quick Chart Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm" data-testid="weekly-spending-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Spending</h3>
            <WeeklyChart />
          </CardContent>
        </Card>

        <Card className="shadow-sm" data-testid="expense-categories-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Expense Categories</h3>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
