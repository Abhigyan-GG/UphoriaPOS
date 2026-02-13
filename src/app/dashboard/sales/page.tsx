"use client";
import { useState, useMemo } from "react";
import { SalesTable } from "@/components/sales/sales-table";
import { useSales } from "@/hooks/use-sales";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { History, Search, Calendar as CalendarIcon, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { format, isWithinInterval } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function SalesPage() {
  const { data: sales, loading } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortConfig, setSortConfig] = useState<{ key: 'created_at' | 'total'; direction: 'desc' | 'asc' }>({
    key: 'created_at',
    direction: 'desc',
  });

  const filteredAndSortedSales = useMemo(() => {
    if (!sales) return [];

    let filteredSales = sales;

    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredSales = filteredSales.filter(sale =>
        sale.id.toLowerCase().includes(lowercasedTerm) ||
        (sale.customer_phone && sale.customer_phone.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Filter by date range
    if (dateRange?.from) {
      // Set the time to the end of the day for the 'to' date to include all sales on that day
      const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : new Date(dateRange.from.setHours(23, 59, 59, 999));
      const fromDate = dateRange.from;

      filteredSales = filteredSales.filter(sale => {
        const saleDate = sale.created_at instanceof Timestamp ? sale.created_at.toDate() : new Date(sale.created_at as any);
        return isWithinInterval(saleDate, { start: fromDate, end: toDate });
      });
    }

    // Sort
    const sortedSales = [...filteredSales].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        const aDate = a.created_at instanceof Timestamp ? a.created_at.toDate() : new Date(a.created_at as any);
        const bDate = b.created_at instanceof Timestamp ? b.created_at.toDate() : new Date(b.created_at as any);
        return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      } else { // 'total'
        return sortConfig.direction === 'asc' ? a.total - b.total : b.total - a.total;
      }
    });

    return sortedSales;
  }, [sales, searchTerm, dateRange, sortConfig]);

  const getSortLabel = () => {
    if (sortConfig.key === 'created_at' && sortConfig.direction === 'desc') return 'Date: Newest';
    if (sortConfig.key === 'created_at' && sortConfig.direction === 'asc') return 'Date: Oldest';
    if (sortConfig.key === 'total' && sortConfig.direction === 'desc') return 'Total: High to Low';
    if (sortConfig.key === 'total' && sortConfig.direction === 'asc') return 'Total: Low to High';
    return 'Sort By';
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-headline font-bold">Sales History</h1>
      </div>
      
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Invoice ID or Phone..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-full md:w-auto min-w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <ArrowDownUp className="mr-2 h-4 w-4" />
                {getSortLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortConfig({ key: 'created_at', direction: 'desc' })}>
                Date: Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortConfig({ key: 'created_at', direction: 'asc' })}>
                Date: Oldest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortConfig({ key: 'total', direction: 'desc' })}>
                Total: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortConfig({ key: 'total', direction: 'asc' })}>
                Total: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredAndSortedSales && filteredAndSortedSales.length > 0 ? (
        <SalesTable sales={filteredAndSortedSales} />
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
              <History className="w-12 h-12 mb-4" />
              <p>No sales recorded yet.</p>
              <p className="text-xs">Completed sales will appear here, or try adjusting your filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
