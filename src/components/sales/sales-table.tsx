
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
import { MoreHorizontal, Send, CheckCircle, XCircle, SkipForward, FileDown, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendWhatsappMessageAction, deleteSaleAction } from "@/lib/actions";
import { Timestamp } from "firebase/firestore";

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
    toast({ title: "Sending WhatsApp Invoice...", description: `Processing request for sale ${saleId}` });
    const result = await sendWhatsappMessageAction(saleId);
    if (result.success) {
      toast({
        title: "WhatsApp Sent (Simulated)",
        description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white whitespace-pre-wrap">{result.message}</code></pre>,
        duration: 9000,
      });
    } else {
      toast({ variant: 'destructive', title: "Failed to Send", description: result.message });
    }
  };

  const handleDelete = async (saleId: string) => {
    if (!confirm(`Are you sure you want to delete sale ${saleId}? This action cannot be undone.`)) {
      return;
    }
    toast({ title: "Deleting Sale...", description: `Removing sale ${saleId}` });
    const result = await deleteSaleAction(saleId);
    if (result.success) {
      toast({ title: "Sale Deleted", description: `Sale ${saleId} has been removed.` });
    } else {
      toast({ variant: 'destructive', title: "Failed", description: "Could not delete the sale." });
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
                const createdAtDate = sale.created_at instanceof Timestamp ? sale.created_at.toDate() : new Date(sale.created_at as any);
                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium truncate max-w-24">{sale.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(createdAtDate, "dd MMM yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(createdAtDate, { addSuffix: true })}</span>
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
                            <DropdownMenuItem disabled>
                                <FileDown className="mr-2 h-4 w-4" /> Download Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResend(sale.id)} disabled={sale.whatsapp_status === 'skipped'}>
                                <Send className="mr-2 h-4 w-4" /> Resend WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sale.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Sale
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
