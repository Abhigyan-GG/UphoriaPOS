"use client";
import { SalesTable } from "@/components/sales/sales-table";
import { useSales } from "@/hooks/use-sales";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

export default function SalesPage() {
  const { data: sales, loading } = useSales();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Sales History</h1>
      </div>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : sales && sales.length > 0 ? (
        <SalesTable sales={sales} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
              <History className="w-12 h-12 mb-4" />
              <p>No sales recorded yet.</p>
              <p className="text-xs">Completed sales will appear here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
