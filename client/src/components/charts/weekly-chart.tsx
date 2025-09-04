import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useTransactions } from "@/contexts/transaction-context";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";

Chart.register(...registerables);

export function WeeklyChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { transactions } = useTransactions();

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Get current week data
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyExpenses = weekDays.map(day => {
      const dayTransactions = transactions.filter(t => 
        t.type === "expense" && isSameDay(new Date(t.date), day)
      );
      return dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const labels = weekDays.map(day => format(day, "EEE"));

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Daily Spending",
          data: dailyExpenses,
          borderColor: "hsl(0 84.2% 60.2%)",
          backgroundColor: "hsla(0, 84.2%, 60.2%, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "hsl(0 84.2% 60.2%)",
          pointBorderColor: "hsl(0 84.2% 60.2%)",
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
            beginAtZero: true,
            grid: {
              color: "hsl(214.3 31.8% 91.4%)"
            },
            ticks: {
              callback: function(value) {
                return "₨" + value;
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

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="h-64 w-full" data-testid="weekly-chart">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
    </div>
  );
}
