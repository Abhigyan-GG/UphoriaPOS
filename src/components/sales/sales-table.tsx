"use client";

import type { Sale } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Send, CheckCircle, XCircle, SkipForward, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { resendInvoiceAction } from "@/lib/actions";

interface SalesTableProps {
  sales: Sale[];
}

const statusConfig = {
    sent: { icon: CheckCircle, color: "bg-green-500", label: "Sent" },
    failed: { icon: XCircle, color: "bg-red-500", label: "Failed" },
    pending: { icon: Send, color: "bg-yellow-500", label: "Pending" },
    skipped: { icon: SkipForward, color: "bg-gray-400", label: "Skipped" }
};

export function SalesTable({ sales }: SalesTableProps) {
  const { toast } = useToast();

  const handleResend = async (saleId: string) => {
    toast({ title: "Resending Invoice...", description: `Processing request for sale ${saleId}` });
    const result = await resendInvoiceAction(saleId);
    if (result.success) {
      toast({ title: "Request Sent!", description: `Invoice for sale ${saleId} is being resent.` });
    } else {
      toast({ variant: 'destructive', title: "Failed", description: "Could not resend the invoice." });
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">WhatsApp Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
                const StatusIcon = statusConfig[sale.whatsapp_status].icon;
                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(sale.created_at), "dd MMM yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })}</span>
                      </div>
                    </TableCell>
                    <TableCell>{sale.customer_phone || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        <StatusIcon className={`h-3 w-3 ${statusConfig[sale.whatsapp_status].color.replace('bg-', 'text-')}`} />
                        {statusConfig[sale.whatsapp_status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">₹{sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem disabled={!sale.invoice_pdf_url}>
                                <FileDown className="mr-2 h-4 w-4" /> Download Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResend(sale.id)} disabled={sale.whatsapp_status === 'skipped'}>
                                <Send className="mr-2 h-4 w-4" /> Resend WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
