import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/contexts/transaction-context";
import { CATEGORY_LABELS } from "@shared/schema";
import { subDays, subMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

Chart.register(...registerables);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  const { transactions } = useTransactions();
  const incomeExpenseChartRef = useRef<HTMLCanvasElement>(null);
  const trendsChartRef = useRef<HTMLCanvasElement>(null);
  const incomeExpenseChartInstance = useRef<Chart | null>(null);
  const trendsChartInstance = useRef<Chart | null>(null);

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "90":
        startDate = subDays(now, 90);
        break;
      case "180":
        startDate = subDays(now, 180);
        break;
      case "365":
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const getCategoryBreakdown = () => {
    const filteredTransactions = getFilteredTransactions();
    const expenses = filteredTransactions.filter(t => t.type === "expense");
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Income vs Expenses Chart
  useEffect(() => {
    if (!incomeExpenseChartRef.current) return;

    if (incomeExpenseChartInstance.current) {
      incomeExpenseChartInstance.current.destroy();
    }

    const ctx = incomeExpenseChartRef.current.getContext("2d");
    if (!ctx) return;

    const filteredTransactions = getFilteredTransactions();
    
    // Group by month for better visualization
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), parseInt(timeRange) / 30),
      end: new Date()
    });

    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses
      };
    });

    incomeExpenseChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: "Income",
            data: monthlyData.map(d => d.income),
            backgroundColor: "hsl(158.1 64.4% 51.6%)",
            borderColor: "hsl(158.1 64.4% 51.6%)",
            borderWidth: 1,
          },
          {
            label: "Expenses",
            data: monthlyData.map(d => d.expenses),
            backgroundColor: "hsl(0 84.2% 60.2%)",
            borderColor: "hsl(0 84.2% 60.2%)",
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return "₨" + value;
              }
            }
          }
        }
      }
    });
  }, [timeRange, transactions]);

  // Monthly Trends Chart
  useEffect(() => {
    if (!trendsChartRef.current) return;

    if (trendsChartInstance.current) {
      trendsChartInstance.current.destroy();
    }

    const ctx = trendsChartRef.current.getContext("2d");
    if (!ctx) return;

    const filteredTransactions = getFilteredTransactions();
    
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), parseInt(timeRange) / 30),
      end: new Date()
    });

    const trendData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, "MMM yyyy"),
        netIncome: income - expenses
      };
    });

    trendsChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: trendData.map(d => d.month),
        datasets: [{
          label: "Net Income",
          data: trendData.map(d => d.netIncome),
          borderColor: "hsl(221.2 83.2% 53.3%)",
          backgroundColor: "hsla(221.2, 83.2%, 53.3%, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "hsl(221.2 83.2% 53.3%)",
          pointBorderColor: "hsl(221.2 83.2% 53.3%)",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            grid: {
              color: "hsl(214.3 31.8% 91.4%)"
            },
            ticks: {
              callback: function(value) {
                return "$" + value;
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }, [timeRange, transactions]);

  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="space-y-6" data-testid="analytics">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Detailed Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm" data-testid="income-expense-chart">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expenses</h3>
            <div className="h-80">
              <canvas ref={incomeExpenseChartRef} className="w-full h-full"></canvas>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" data-testid="trends-chart">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trends</h3>
            <div className="h-80">
              <canvas ref={trendsChartRef} className="w-full h-full"></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="shadow-sm" data-testid="category-breakdown">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Category Breakdown</h3>
          
          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-categories">
              <div className="text-muted-foreground">
                <i className="fas fa-chart-pie text-4xl mb-4"></i>
                <p className="text-lg font-medium">No expense data</p>
                <p className="text-sm">Add some expenses to see category breakdown</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBreakdown.map((category, index) => {
                const colors = [
                  "bg-destructive",
                  "bg-accent", 
                  "bg-primary",
                  "bg-secondary",
                  "bg-muted-foreground"
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div 
                    key={category.name} 
                    className="border border-border rounded-lg p-4"
                    data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 ${colorClass} rounded-full`}></div>
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      ₨{category.amount.toFixed(2)}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
