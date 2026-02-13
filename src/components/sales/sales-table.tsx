
"use client";

import { useState } from "react";
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
import { MoreHorizontal, Send, CheckCircle, XCircle, SkipForward, FileDown, Trash2, ExternalLink, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

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

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailViewOpen(true);
  };

  const onDialogClose = (open: boolean) => {
    setIsDetailViewOpen(open);
    if (!open) {
      setSelectedSale(null);
    }
  };

  const totalProfit = selectedSale?.items.reduce((acc, item) => {
    const profitPerItem = (item.unit_price - item.cost_price) * item.quantity;
    return acc + profitPerItem;
  }, 0);

  return (
    <>
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
                                <DropdownMenuItem onClick={() => handleViewPdf(sale.invoice_pdf_url)}>
                                  <ExternalLink className="mr-2 h-4 w-4" /> View Invoice PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewDetails(sale)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
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

      <Dialog open={isDetailViewOpen} onOpenChange={onDialogClose}>
        {selectedSale && (
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-semibold">Invoice ID:</span> {selectedSale.id}</div>
                  <div><span className="font-semibold">Customer:</span> {selectedSale.customer_phone || 'N/A'}</div>
                  <div><span className="font-semibold">Date:</span> {format(selectedSale.created_at instanceof Timestamp ? selectedSale.created_at.toDate() : new Date(selectedSale.created_at as any), "dd MMM yyyy, HH:mm")}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map(item => (
                      <TableRow key={item.product_id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₹{item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.cost_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.line_total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{selectedSale.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{selectedSale.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>- ₹{selectedSale.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>₹{selectedSale.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2">
                            <span>Profit</span>
                            <span>₹{totalProfit?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </div>
            </DialogContent>
          )}
      </Dialog>
    </>
  );
}
