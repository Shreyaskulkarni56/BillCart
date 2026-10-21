import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Search,
  ArrowUpRight,
  Download,
  IndianRupee,
  CheckCircle2,
  QrCode,
  Banknote,
  Receipt,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Calendar,
  Check,
  Edit3,
  DollarSign,
  Building,
} from "lucide-react";
import InvoiceDialog from "@/components/InvoiceDialog";
import { Sale } from "../types";
import { toast } from "sonner";
import {
  PaymentRecord,
  PaymentMode,
  getSavedPaymentRecords,
  savePaymentRecord as persistPaymentRecord,
  calculateCreditStatus,
} from "@/lib/paymentHelper";

const Transactions: React.FC = () => {
  const { sales, customers, updateSaleDate } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Admin managed payment status state persisted in localStorage
  const [paymentRecords, setPaymentRecords] = useState<Record<string, PaymentRecord>>(getSavedPaymentRecords);

  // Sync across tabs/components
  useEffect(() => {
    const handleSync = () => {
      setPaymentRecords(getSavedPaymentRecords());
    };
    window.addEventListener("billcart_payment_update", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("billcart_payment_update", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Modal state for editing payment record
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    status: "pending" | "paid" | "partial";
    mode: PaymentMode;
    settledDate: string;
    referenceNo: string;
    amountPaid: number;
    notes: string;
  }>({
    status: "paid",
    mode: "UPI",
    settledDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    amountPaid: 0,
    notes: "",
  });

  const savePaymentRecord = (saleId: string, record: PaymentRecord) => {
    const updated = persistPaymentRecord(saleId, record);
    setPaymentRecords(updated);
  };

  // Compute enriched transaction ledger with 15-30 days credit terms
  const transactions = useMemo(() => {
    const now = new Date();

    return sales.map((sale) => {
      const saleDate = new Date(sale.date);
      // Distribution standard credit window: 30 days
      const dueDate = new Date(saleDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Remaining days until due
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceInvoice = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));

      const recorded = paymentRecords[sale.id];

      let effectiveStatus: "pending" | "paid" | "partial" | "overdue" = "pending";
      let mode: PaymentMode = "Credit (15-30 Days)";
      let settledDate: string | undefined = undefined;
      let referenceNo = `TXN-${sale.invoiceNo || sale.id.slice(-6)}`;
      let amountPaid = 0;

      if (recorded) {
        effectiveStatus = recorded.status;
        mode = recorded.mode || "Credit (15-30 Days)";
        settledDate = recorded.settledDate;
        referenceNo = recorded.referenceNo || referenceNo;
        amountPaid = recorded.amountPaid || (recorded.status === "paid" ? sale.total : 0);
      } else {
        // Not recorded yet: Check if 30 days credit period has expired
        if (daysUntilDue < 0) {
          effectiveStatus = "overdue";
        } else {
          effectiveStatus = "pending";
        }
      }

      return {
        ...sale,
        effectiveStatus,
        mode,
        settledDate,
        referenceNo,
        amountPaid,
        daysUntilDue,
        daysSinceInvoice,
        dueDate,
      };
    });
  }, [sales, paymentRecords]);

  // Quick 1-click "Mark as Paid" action by Admin
  const handleQuickMarkPaid = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecord: PaymentRecord = {
      status: "paid",
      mode: "UPI",
      settledDate: new Date().toISOString().split("T")[0],
      referenceNo: `UPI${Date.now().toString().slice(-6)}`,
      amountPaid: sale.total,
      notes: "Confirmed & settled by Admin",
    };
    savePaymentRecord(sale.id, newRecord);
    toast.success(`Payment for invoice ${sale.invoiceNo || sale.id} marked as Paid!`);
  };

  // Open modal to record payment with custom mode & reference
  const handleOpenEditPayment = (sale: Sale, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = paymentRecords[sale.id];
    setEditingSale(sale);
    setPaymentForm({
      status: current?.status || "paid",
      mode: current?.mode || "UPI",
      settledDate: current?.settledDate || new Date().toISOString().split("T")[0],
      referenceNo: current?.referenceNo || `TXN${Date.now().toString().slice(-6)}`,
      amountPaid: current?.amountPaid || sale.total,
      notes: current?.notes || "",
    });
  };

  // Save modal form
  const handleSavePaymentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    savePaymentRecord(editingSale.id, {
      status: paymentForm.status,
      mode: paymentForm.mode,
      settledDate: paymentForm.settledDate,
      referenceNo: paymentForm.referenceNo,
      amountPaid: Number(paymentForm.amountPaid),
      notes: paymentForm.notes,
    });

    toast.success(`Payment record updated for ${editingSale.invoiceNo || editingSale.id}`);
    setEditingSale(null);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        (t.invoiceNo || t.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return t.effectiveStatus === "pending" || t.effectiveStatus === "partial";
      if (statusFilter === "paid") return t.effectiveStatus === "paid";
      if (statusFilter === "overdue") return t.effectiveStatus === "overdue";

      return true;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Aggregate KPI metrics
  const totalInvoiced = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalPaid = transactions
    .filter((t) => t.effectiveStatus === "paid")
    .reduce((acc, t) => acc + t.total, 0);
  const totalPending = transactions
    .filter((t) => t.effectiveStatus === "pending" || t.effectiveStatus === "partial")
    .reduce((acc, t) => acc + (t.total - (t.amountPaid || 0)), 0);
  const totalOverdue = transactions
    .filter((t) => t.effectiveStatus === "overdue")
    .reduce((acc, t) => acc + t.total, 0);

  const pendingCount = transactions.filter((t) => t.effectiveStatus === "pending" || t.effectiveStatus === "partial").length;
  const paidCount = transactions.filter((t) => t.effectiveStatus === "paid").length;
  const overdueCount = transactions.filter((t) => t.effectiveStatus === "overdue").length;

  // Export ledger to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["Invoice No", "Date", "Customer", "Total Amount (INR)", "Payment Status", "Payment Mode", "Due Date", "Settled Date", "Reference No"];
    const rows = transactions.map((t) => [
      t.invoiceNo,
      new Date(t.date).toISOString().split("T")[0],
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.total.toFixed(2),
      t.effectiveStatus.toUpperCase(),
      t.mode,
      t.dueDate.toISOString().split("T")[0],
      t.settledDate || "Unsettled",
      t.referenceNo,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction ledger exported to CSV!");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Transactions & Credit Ledger</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Credit Management
            </Badge>
          </div>
          <p className="page-subtitle">
            Track client payments, reconcile 15–30 days credit terms, and record settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Credit Terms Information Callout */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Client Credit Policy:</strong> All generated sales invoices are placed on a <strong>15 to 30 days credit window</strong>. Payment status is only marked as <em>Paid</em> when confirmed and reconciled by Admin.
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60 whitespace-nowrap">
          {pendingCount} Pending Invoices
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-indigo-600">
            ₹{totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{transactions.length} total client billings</p>
        </div>

        {/* Pending Receivables (Credit Window) */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Pending Receivables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-amber-600">
            ₹{totalPending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{pendingCount} invoices in 15–30d credit window</p>
        </div>

        {/* Collected & Settled */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Collected & Settled</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-emerald-600">
            ₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{paidCount} confirmed settlements</p>
        </div>

        {/* Overdue */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Overdue (&gt;30 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-rose-600">
            ₹{totalOverdue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{overdueCount} invoices past 30 days credit</p>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="table-container">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === "pending" ? "bg-white text-amber-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending Credit ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === "paid" ? "bg-white text-emerald-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid / Settled ({paidCount})
            </button>
            <button
              onClick={() => setStatusFilter("overdue")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === "overdue" ? "bg-white text-rose-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overdue ({overdueCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, customer, or ref..."
              className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Credit Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Settlement Mode</th>
                <th className="py-3 px-4 text-center">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No transactions match active filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Change status tab or clear search query to inspect records.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedSale(t)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Invoice No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 group-hover:underline">
                      {t.invoiceNo || t.id.substring(0, 8)}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{t.customerName}</div>
                      {t.customerGstinNo && (
                        <div className="text-[10px] font-mono text-slate-400">GSTIN: {t.customerGstinNo}</div>
                      )}
                    </td>

                    {/* Invoice Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Due Date & Remaining Days */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.effectiveStatus === "paid" ? (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Settled on {t.settledDate ? new Date(t.settledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Record"}
                        </span>
                      ) : t.effectiveStatus === "overdue" ? (
                        <div>
                          <span className="font-mono text-rose-700 font-bold block text-[11px]">
                            {t.dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-[10px] text-rose-600 font-semibold">
                            Overdue by {Math.abs(t.daysUntilDue)} days
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono text-slate-700 font-medium block text-[11px]">
                            {t.dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            Due in {t.daysUntilDue} days (30d credit)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      ₹{t.total.toFixed(2)}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {t.effectiveStatus === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid (Settled)
                        </span>
                      ) : t.effectiveStatus === "overdue" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Overdue
                        </span>
                      ) : t.effectiveStatus === "partial" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          Partial (₹{t.amountPaid.toFixed(2)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending (Credit)
                        </span>
                      )}
                    </td>

                    {/* Settlement Mode / Reference */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {t.effectiveStatus === "paid" ? (
                        <div className="text-[11px] font-mono">
                          <span className="font-semibold text-slate-800">{t.mode}</span>
                          <span className="text-slate-400 block text-[10px] truncate max-w-[120px]">{t.referenceNo}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-mono">
                          Awaiting Payment
                        </span>
                      )}
                    </td>

                    {/* Admin Action */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {t.effectiveStatus !== "paid" ? (
                          <Button
                            size="sm"
                            onClick={(e) => handleQuickMarkPaid(t, e)}
                            className="h-7 px-2.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark Paid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleOpenEditPayment(t, e)}
                            className="h-7 px-2 text-[11px] font-medium border-slate-200 bg-white hover:bg-slate-50 gap-1 text-slate-700"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedSale(t)}
                          className="h-7 px-2 text-[11px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record / Update Payment Modal */}
      {editingSale && (
        <Dialog open={true} onOpenChange={() => setEditingSale(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl p-5 shadow-xl">
            <DialogHeader className="border-b pb-3 border-slate-100">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Record Client Payment</span>
                <span className="badge-pill bg-indigo-50 text-indigo-700 font-mono text-xs">
                  {editingSale.invoiceNo || editingSale.id}
                </span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSavePaymentForm} className="space-y-4 py-2 text-xs">
              {/* Customer & Invoice Total info */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Customer</span>
                  <span className="font-bold text-slate-900 text-sm">{editingSale.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Invoice Amount</span>
                  <span className="font-bold font-mono text-indigo-700 text-base">₹{editingSale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-700">Payment Status *</Label>
                <Select
                  value={paymentForm.status}
                  onValueChange={(val: any) => setPaymentForm({ ...paymentForm, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (Fully Settled)</SelectItem>
                    <SelectItem value="pending">Pending (15–30 Days Credit)</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-700">Settlement Method</Label>
                <Select
                  value={paymentForm.mode}
                  onValueChange={(val: any) => setPaymentForm({ ...paymentForm, mode: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI (GPay / PhonePe / Paytm / QR)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</SelectItem>
                    <SelectItem value="Cash">Cash Handover</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Debit / Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference ID & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentForm.settledDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, settledDate: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">Reference / UTR / Cheque #</Label>
                  <Input
                    value={paymentForm.referenceNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                    placeholder="e.g. UTR123456"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Amount Settled */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-700">Amount Received (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-slate-700">Audit Notes (Optional)</Label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="e.g. Received via WhatsApp screenshot confirmation"
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSale(null)}
                  className="h-9 text-xs border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Save Payment Status
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice modal for inspection with QR Code */}
      {selectedSale && (
        <InvoiceDialog
          isOpen={true}
          onClose={() => setSelectedSale(null)}
          customer={
            customers.find((c) => c.id === selectedSale.customerId) ||
            ({
              name: selectedSale.customerName,
              dlNo: selectedSale.customerDlNo,
              gstinNo: selectedSale.customerGstinNo,
            } as any)
          }
          items={selectedSale.items as any}
          onUpdateItem={() => {}}
          onRemoveItem={() => {}}
          onConfirm={() => {}}
          discount={0}
          onDiscountChange={() => {}}
          isReadOnly={true}
          pastInvoiceNo={selectedSale.invoiceNo}
          pastDate={selectedSale.date}
          pastPaymentMode={paymentRecords[selectedSale.id]?.mode || "Credit (15-30 Days)"}
          onUpdateDate={(newDate) => {
            if (selectedSale.id) {
              updateSaleDate(selectedSale.id, newDate);
              setSelectedSale({ ...selectedSale, date: newDate });
            }
          }}
        />
      )}
    </div>
  );
};

export default Transactions;
