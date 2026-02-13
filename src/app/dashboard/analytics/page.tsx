
"use client";

import { useSales } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, DollarSign, ShoppingBag, ArrowDown, ArrowUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { format, subDays } from "date-fns";
import type { Sale, Product } from "@/lib/types";

export default function AnalyticsPage() {
  const { data: sales, loading: salesLoading } = useSales();
  const { data: products, loading: productsLoading } = useProducts();

  const loading = salesLoading || productsLoading;

  const { totalRevenue, totalProfit, totalSales, chartData } = useMemo(() => {
    if (!sales || !products) {
      return { totalRevenue: 0, totalProfit: 0, totalSales: 0, chartData: [] };
    }

    const productCosts = new Map(products.map(p => [p.id, p.cost_price]));

    let totalRevenue = 0;
    let totalProfit = 0;
    const salesByDay: { [key: string]: { sales: number; revenue: number } } = {};

    sales.forEach(sale => {
      totalRevenue += sale.total;
      
      const saleCost = sale.items.reduce((acc, item) => {
        const cost = productCosts.get(item.product_id) || item.unit_price;
        return acc + (cost * item.quantity);
      }, 0);
      
      totalProfit += (sale.subtotal - saleCost);

      const day = format(sale.created_at.toDate(), "yyyy-MM-dd");
      if (!salesByDay[day]) {
        salesByDay[day] = { sales: 0, revenue: 0 };
      }
      salesByDay[day].sales += 1;
      salesByDay[day].revenue += sale.total;
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd")).reverse();
    
    const chartData = last7Days.map(day => ({
        date: format(new Date(day), "MMM dd"),
        revenue: salesByDay[day]?.revenue || 0,
    }));

    return { totalRevenue, totalProfit, totalSales: sales.length, chartData };
  }, [sales, products]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-headline font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">From {totalSales} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            {totalProfit >= 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Estimated profit from sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Total number of transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    )
}
