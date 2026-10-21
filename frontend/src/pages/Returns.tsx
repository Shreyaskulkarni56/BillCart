import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  IndianRupee,
  Receipt,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface ReturnRecord {
  id: string;
  creditNoteNo: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  productName: string;
  productId: string;
  quantity: number;
  unit: string;
  refundAmount: number;
  reason: string;
  refundType: string;
}

const Returns: React.FC = () => {
  const { sales, products, updateProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [returns, setReturns] = useState<ReturnRecord[]>(() => {
    const saved = localStorage.getItem("billcart_returns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "ret-1",
        creditNoteNo: "CN-2024-001",
        invoiceNo: sales[0]?.invoiceNo || "SLN-1001",
        customerName: sales[0]?.customerName || "Ramesh Kumar",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        productId: products[0]?.id || "1",
        productName: products[0]?.name || "Ashwagandha Churna",
        quantity: 1,
        unit: products[0]?.unit || "Piece",
        refundAmount: products[0]?.price || 150,
        reason: "Customer Requested Exchange",
        refundType: "Store Credit",
      },
    ];
  });

  const [formData, setFormData] = useState({
    saleId: "",
    productId: "",
    quantity: 1,
    reason: "Damaged / Broken Seal",
    refundType: "Store Credit",
  });

  const saveReturns = (newList: ReturnRecord[]) => {
    setReturns(newList);
    localStorage.setItem("billcart_returns", JSON.stringify(newList));
  };

  const handleOpenModal = () => {
    const firstSale = sales[0];
    const firstItem = firstSale?.items[0];
    setFormData({
      saleId: firstSale?.id || "",
      productId: firstItem?.productId || products[0]?.id || "",
      quantity: 1,
      reason: "Customer Requested Return",
      refundType: "Store Credit",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sale = sales.find((s) => s.id === formData.saleId);
    const product = products.find((p) => p.id === formData.productId);

    if (!product) {
      toast.error("Please select a valid product to return");
      return;
    }

    const qty = Number(formData.quantity);
    const refundAmount = qty * product.price;

    const newRecord: ReturnRecord = {
      id: "ret-" + Date.now(),
      creditNoteNo: `CN-${new Date().getFullYear()}-${(returns.length + 1).toString().padStart(3, "0")}`,
      invoiceNo: sale?.invoiceNo || `SLN-${Date.now().toString().slice(-4)}`,
      customerName: sale?.customerName || "Counter Customer",
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unit: product.unit,
      refundAmount,
      reason: formData.reason,
      refundType: formData.refundType,
    };

    try {
      // Re-increment product stock since item was returned
      await updateProduct({
        ...product,
        stock: product.stock + qty,
      });

      saveReturns([newRecord, ...returns]);
      setIsModalOpen(false);
      toast.success(
        `Issued Credit Note ${newRecord.creditNoteNo}. Restored ${qty} ${product.unit} to stock.`
      );
    } catch (err: any) {
      toast.error("Failed to process return");
    }
  };

  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.creditNoteNo.toLowerCase().includes(q) ||
      r.invoiceNo.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q)
    );
  });

  const totalRefunded = returns.reduce((sum, r) => sum + r.refundAmount, 0);
  const totalItemsReturned = returns.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Returns & Credit Notes</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {returns.length} Records
            </Badge>
          </div>
          <p className="page-subtitle">
            Manage product returns, refund adjustments, and restore items back into stock.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Return / Credit Note
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Refunded Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-amber-600">
            ₹{totalRefunded.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{returns.length} credit notes issued</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Units Restored to Stock</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">{totalItemsReturned}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Re-added to active inventory</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Return Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">
            {sales.length > 0 ? ((returns.length / sales.length) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Of total invoice volume</p>
        </div>
      </div>

      {/* Returns Table */}
      <div className="table-container">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search credit note #, invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Credit Note #</th>
                <th className="py-3 px-4">Original Invoice</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Returned Product</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No returns recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Returns and credit notes will appear here when processed.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-amber-600">
                      {r.creditNoteNo}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-600">
                      {r.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(r.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                      {r.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-900">
                      {r.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                      {r.quantity} {r.unit}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹{r.refundAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Restocked
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      {isModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsModalOpen(false)}>
          <DialogContent className="max-w-lg bg-white border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Process Return & Issue Credit Note
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Original Invoice *
                </label>
                <Select
                  value={formData.saleId}
                  onValueChange={(val) => {
                    const sale = sales.find((s) => s.id === val);
                    setFormData({
                      ...formData,
                      saleId: val,
                      productId: sale?.items[0]?.productId || formData.productId,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs bg-white">
                    <SelectValue placeholder="Choose sale invoice" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 max-h-56">
                    {sales.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.invoiceNo || s.id.substring(0, 8)} - {s.customerName} (₹{s.total.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product to Return *
                </label>
                <Select
                  value={formData.productId}
                  onValueChange={(val) => setFormData({ ...formData, productId: val })}
                >
                  <SelectTrigger className="h-10 text-xs bg-white">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 max-h-56">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name} - ₹{p.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Quantity Returned *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Refund Mode
                  </label>
                  <Select
                    value={formData.refundType}
                    onValueChange={(val) => setFormData({ ...formData, refundType: val })}
                  >
                    <SelectTrigger className="h-10 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200">
                      <SelectItem value="Store Credit">Store Credit</SelectItem>
                      <SelectItem value="Cash Refund">Cash Refund</SelectItem>
                      <SelectItem value="UPI / Bank">UPI Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Return
                </label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Expired batch, packaging defect, exchange"
                  className="h-10 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Issue Credit Note & Restock
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Returns;
