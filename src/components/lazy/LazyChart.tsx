import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';

// Lazy load chart components
const WeeklyAppointmentsChart = lazy(() => 
  import('@/components/dashboard/WeeklyAppointmentsChart')
);

const RechartsComponents = lazy(() => 
  import('recharts').then(module => ({
    default: {
      BarChart: module.BarChart,
      Bar: module.Bar,
      XAxis: module.XAxis,
      YAxis: module.YAxis,
      CartesianGrid: module.CartesianGrid,
      Tooltip: module.Tooltip,
      ResponsiveContainer: module.ResponsiveContainer,
      LineChart: module.LineChart,
      Line: module.Line,
      PieChart: module.PieChart,
      Pie: module.Pie,
      Cell: module.Cell,
    }
  }))
);

// Loading skeleton for charts
const ChartLoader = ({ title, height = '300px' }: { title?: string; height?: string }) => (
  <Card>
    {title && (
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <div 
        className="flex items-center justify-center bg-muted/30 rounded-md animate-pulse"
        style={{ height }}
      >
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading chart...</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Lazy Weekly Appointments Chart
interface LazyWeeklyChartProps {
  data?: any[];
  title?: string;
}

export const LazyWeeklyChart = ({ data, title = "Weekly Appointments" }: LazyWeeklyChartProps) => {
  return (
    <Suspense fallback={<ChartLoader title={title} height="300px" />}>
      <WeeklyAppointmentsChart />
    </Suspense>
  );
};

// Generic Lazy Chart Container
interface LazyChartContainerProps {
  children: React.ReactNode;
  title?: string;
  height?: string;
  icon?: React.ReactNode;
}

export const LazyChartContainer = ({ 
  children, 
  title, 
  height = "300px",
  icon = <TrendingUp className="h-4 w-4" />
}: LazyChartContainerProps) => {
  return (
    <Suspense fallback={<ChartLoader title={title} height={height} />}>
      <Card>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </Suspense>
  );
};

// Lazy Recharts Components Export
export const LazyRecharts = () => {
  return (
    <Suspense fallback={<div>Loading chart library...</div>}>
      <RechartsComponents />
    </Suspense>
  );
};

export default LazyWeeklyChart;