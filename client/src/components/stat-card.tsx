import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  progress?: number;
}

export function StatCard({ title, value, icon, trend, progress }: StatCardProps) {
  return (
    <Card className="shadow-sm" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</p>
            <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} ${trend.isPositive ? 'text-secondary' : 'text-destructive'} mr-1`}></i>
            <span className={`${trend.isPositive ? 'text-secondary' : 'text-destructive'} font-medium`}>
              {trend.value}
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}

        {progress !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
