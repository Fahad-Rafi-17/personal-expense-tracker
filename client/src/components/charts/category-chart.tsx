import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useTransactions } from "@/contexts/transaction-context";
import { CATEGORY_LABELS } from "@shared/schema";

Chart.register(...registerables);

export function CategoryChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { monthlyTransactions } = useTransactions();

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Calculate category totals for expenses only
    const expenses = monthlyTransactions.filter(t => t.type === "expense");
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 categories

    if (sortedCategories.length === 0) {
      // Show empty state
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["No expenses"],
          datasets: [{
            data: [1],
            backgroundColor: ["hsl(215.4 16.3% 46.9%)"],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "hsl(215.4 16.3% 46.9%)"
              }
            }
          }
        }
      });
      return;
    }

    const labels = sortedCategories.map(([category]) => 
      CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
    );
    const data = sortedCategories.map(([, amount]) => amount);

    const colors = [
      "hsl(0 84.2% 60.2%)",    // destructive
      "hsl(24.6 95% 53.1%)",   // accent  
      "hsl(221.2 83.2% 53.3%)", // primary
      "hsl(158.1 64.4% 51.6%)", // secondary
      "hsl(215.4 16.3% 46.9%)"  // muted-foreground
    ];

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: "hsl(0 0% 100%)",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ₨${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [monthlyTransactions]);

  return (
    <div className="h-64 w-full" data-testid="category-chart">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
    </div>
  );
}
