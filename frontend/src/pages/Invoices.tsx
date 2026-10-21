import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Plus,
  Printer,
  Calendar,
  Filter,
  ArrowUpDown,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Check,
  CreditCard,
} from "lucide-react";
import InvoiceDialog from "@/components/InvoiceDialog";
import { Sale } from "../types";
import { toast } from "sonner";
import {
  PaymentRecord,
  getSavedPaymentRecords,
  savePaymentRecord,
  calculateCreditStatus,
} from "@/lib/paymentHelper";

const Invoices: React.FC = () => {
  const { sales, customers, updateSaleDate } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc">("date-desc");

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

  // Quick 1-click "Mark as Paid" action by Admin
  const handleQuickMarkPaid = (sale: Sale, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecord: PaymentRecord = {
      status: "paid",
      mode: "UPI",
      settledDate: new Date().toISOString().split("T")[0],
      referenceNo: `UPI${Date.now().toString().slice(-6)}`,
      amountPaid: sale.total,
      notes: "Settled & verified by Admin",
    };
    const updated = savePaymentRecord(sale.id, newRecord);
    setPaymentRecords(updated);
    toast.success(`Payment for invoice ${sale.invoiceNo || sale.id} marked as Paid!`);
  };

  // Enriched sales with credit calculations
  const enrichedSales = useMemo(() => {
    return sales.map((sale) => {
      const credit = calculateCreditStatus(sale, paymentRecords[sale.id]);
      return {
        ...sale,
        credit,
      };
    });
  }, [sales, paymentRecords]);

  // Filtering & searching
  const filteredSales = useMemo(() => {
    return enrichedSales
      .filter((sale) => {
        const q = searchQuery.toLowerCase();
        const invoiceNo = (sale.invoiceNo || sale.id || "").toLowerCase();
        const customer = (sale.customerName || "").toLowerCase();
        const dateStr = new Date(sale.date).toLocaleDateString().toLowerCase();
        const matchesQuery = invoiceNo.includes(q) || customer.includes(q) || dateStr.includes(q);

        if (!matchesQuery) return false;

        if (statusFilter === "all") return true;
        if (statusFilter === "pending") return sale.credit.effectiveStatus === "pending" || sale.credit.effectiveStatus === "partial";
        if (statusFilter === "paid") return sale.credit.effectiveStatus === "paid";
        if (statusFilter === "overdue") return sale.credit.effectiveStatus === "overdue";

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "amount-desc") {
          return b.total - a.total;
        }
        return 0;
      });
  }, [enrichedSales, searchQuery, statusFilter, sortBy]);

  // KPI Calculations
  const totalInvoices = sales.length;
  const totalBilled = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPending = enrichedSales
    .filter((s) => s.credit.effectiveStatus === "pending" || s.credit.effectiveStatus === "partial")
    .reduce((sum, s) => sum + (s.total - s.credit.amountPaid), 0);
  const totalPaid = enrichedSales
    .filter((s) => s.credit.effectiveStatus === "paid")
    .reduce((sum, s) => sum + s.total, 0);
  const totalOverdue = enrichedSales
    .filter((s) => s.credit.effectiveStatus === "overdue")
    .reduce((sum, s) => sum + s.total, 0);

  const pendingCount = enrichedSales.filter((s) => s.credit.effectiveStatus === "pending" || s.credit.effectiveStatus === "partial").length;
  const paidCount = enrichedSales.filter((s) => s.credit.effectiveStatus === "paid").length;
  const overdueCount = enrichedSales.filter((s) => s.credit.effectiveStatus === "overdue").length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Invoice History</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {totalInvoices} Invoices
            </Badge>
          </div>
          <p className="page-subtitle">
            View, inspect, print, and audit customer tax invoices with 15–30 days credit terms.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate("/billing")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Credit Policy Callout */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>B2B Credit Window (15–30 Days):</strong> Invoices default to <em>Pending Credit</em> upon generation. Payment status is only marked as <em>Paid</em> once payment is received and confirmed by Admin.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/transactions")}
          className="h-7 text-xs font-semibold border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
        >
          View Credit Ledger
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-indigo-600">₹{totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{totalInvoices} completed invoices</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Pending Credit (15–30d)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-amber-600">₹{totalPending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{pendingCount} within credit window</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Collected & Settled</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-emerald-600">₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{paidCount} confirmed payments</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Overdue (&gt;30 Days)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-rose-600">₹{totalOverdue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{overdueCount} past credit period</p>
        </div>
      </div>

      {/* Invoices Table & Search Controls */}
      <div className="table-container">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Invoices ({sales.length})
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

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search invoice #, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white border-slate-200 text-xs"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Value</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Tax (GST)</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Credit & Payment Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No invoices found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? "Try refining your search terms" : "Generate your first invoice from the Billing section"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const status = sale.credit;
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                        {sale.invoiceNo || sale.id.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {new Date(sale.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 text-xs group-hover:text-indigo-600 transition-colors">
                          {sale.customerName}
                        </p>
                        {sale.customerGstinNo && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            GSTIN: {sale.customerGstinNo}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {sale.items?.length || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-xs">
                        ₹{sale.tax.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹{sale.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.colorClass.bg} ${status.colorClass.text} ${status.colorClass.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.colorClass.dot}`} />
                            {status.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {status.sublabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {status.effectiveStatus !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleQuickMarkPaid(sale, e)}
                              className="h-8 px-2 text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              title="Mark as Paid once payment is confirmed"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSale(sale)}
                            className="h-8 text-xs font-semibold border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            View / Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal in Read-Only Preview Mode */}
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

export default Invoices;
