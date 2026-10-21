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
  Truck,
  Plus,
  Search,
  Package,
  Calendar,
  CheckCircle2,
  Receipt,
  IndianRupee,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface PurchaseRecord {
  id: string;
  purchaseNo: string;
  supplierName: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  totalCost: number;
  batchNo?: string;
}

const Purchases: React.FC = () => {
  const { products, updateProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial persistent purchase records from localStorage or defaults
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem("billcart_purchases");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "p-1",
        purchaseNo: "PO-2024-001",
        supplierName: "Apex Pharma Distributors",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        productId: products[0]?.id || "1",
        productName: products[0]?.name || "Ashwagandha Churna",
        quantity: 50,
        unit: products[0]?.unit || "Piece",
        costPrice: products[0]?.price ? Math.round(products[0].price * 0.7) : 120,
        totalCost: (products[0]?.price ? Math.round(products[0].price * 0.7) : 120) * 50,
        batchNo: "BATCH-892",
      },
    ];
  });

  const [formData, setFormData] = useState({
    supplierName: "",
    purchaseNo: `PO-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(3, "0")}`,
    productId: "",
    quantity: 20,
    costPrice: 0,
    batchNo: "",
  });

  const savePurchases = (newList: PurchaseRecord[]) => {
    setPurchases(newList);
    localStorage.setItem("billcart_purchases", JSON.stringify(newList));
  };

  const handleOpenModal = () => {
    setFormData({
      supplierName: "",
      purchaseNo: `PO-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(3, "0")}`,
      productId: products[0]?.id || "",
      quantity: 20,
      costPrice: products[0] ? Math.round(products[0].price * 0.7) : 100,
      batchNo: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      toast.error("Please select a valid product");
      return;
    }
    if (!formData.supplierName.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }

    const qty = Number(formData.quantity);
    const cost = Number(formData.costPrice);
    const total = qty * cost;

    const newRecord: PurchaseRecord = {
      id: "p-" + Date.now(),
      purchaseNo: formData.purchaseNo || `PO-${Date.now().toString().slice(-4)}`,
      supplierName: formData.supplierName,
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unit: product.unit,
      costPrice: cost,
      totalCost: total,
      batchNo: formData.batchNo,
    };

    // Update actual inventory stock in database/state
    try {
      await updateProduct({
        ...product,
        stock: product.stock + qty,
        batchNo: formData.batchNo || product.batchNo,
      });

      savePurchases([newRecord, ...purchases]);
      setIsModalOpen(false);
      toast.success(
        `Received ${qty} ${product.unit}s of ${product.name}. Stock updated to ${product.stock + qty}!`
      );
    } catch (err: any) {
      toast.error("Failed to update product stock");
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.purchaseNo.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      p.productName.toLowerCase().includes(q)
    );
  });

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalUnitsInward = purchases.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Purchases & Inward Stock</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Supplier Intake
            </Badge>
          </div>
          <p className="page-subtitle">
            Log supplier bills, purchase orders, and automatically replenish inventory stock.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Record New Purchase
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Inward Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-indigo-600">
            ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{purchases.length} supplier orders received</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Units Inward</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">{totalUnitsInward}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Added directly to active stock</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Active Suppliers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">
            {new Set(purchases.map((p) => p.supplierName)).size}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Verified vendors</p>
        </div>
      </div>

      {/* Purchases Table Container */}
      <div className="table-container">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by PO #, supplier name, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">PO / Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Qty Received</th>
                <th className="py-3 px-4 text-right">Cost / Unit</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No purchase records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Click "Record New Purchase" to log your first supplier delivery.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">
                      {p.purchaseNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(p.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                      {p.supplierName}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 text-xs">{p.productName}</p>
                      {p.batchNo && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Batch: {p.batchNo}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                      +{p.quantity} {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                      ₹{p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹{p.totalCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3" />
                        In Stock
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsModalOpen(false)}>
          <DialogContent className="max-w-lg bg-white border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Record Inward Supplier Purchase
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    PO / Bill Number *
                  </label>
                  <Input
                    required
                    value={formData.purchaseNo}
                    onChange={(e) => setFormData({ ...formData, purchaseNo: e.target.value })}
                    className="h-10 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Supplier Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Apex Pharma"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product *
                </label>
                <Select
                  value={formData.productId}
                  onValueChange={(val) => {
                    const prod = products.find((p) => p.id === val);
                    setFormData({
                      ...formData,
                      productId: val,
                      costPrice: prod ? Math.round(prod.price * 0.7) : formData.costPrice,
                    });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs bg-white">
                    <SelectValue placeholder="Select product to replenish" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 max-h-56">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name} ({p.sku}) - Current Stock: {p.stock} {p.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Qty Received *
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
                    Cost Price (₹) *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="h-10 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batch Number
                  </label>
                  <Input
                    placeholder="BATCH-001"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    className="h-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex justify-between items-center text-indigo-900">
                <span>Calculated Total Cost:</span>
                <span className="font-bold text-sm font-mono">
                  ₹{(formData.quantity * formData.costPrice).toFixed(2)}
                </span>
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
                  Confirm & Update Stock
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Purchases;
