import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
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
  Layers,
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Product } from "../types";
import { toast } from "sonner";

const Inventory: React.FC = () => {
  const { products, updateProduct, getLowStockProducts } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "low" | "out">("all");
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<"add" | "set">("add");

  const lowStockItems = getLowStockProducts ? getLowStockProducts() : [];
  const outOfStockItems = products.filter((p) => p.stock === 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === "low") return product.stock > 0 && product.stock <= product.minStock;
    if (filterTab === "out") return product.stock === 0;
    return true;
  });

  const handleStockAdjustment = async () => {
    if (!adjustingProduct) return;
    const newStock =
      adjustType === "add"
        ? Math.max(0, adjustingProduct.stock + adjustmentQty)
        : Math.max(0, adjustmentQty);

    try {
      await updateProduct({
        ...adjustingProduct,
        stock: newStock,
      });
      toast.success(
        `Updated stock for ${adjustingProduct.name}: ${newStock} ${adjustingProduct.unit}s available.`
      );
      setAdjustingProduct(null);
    } catch (err: any) {
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Stock & Inventory</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {products.length} SKUs Tracked
            </Badge>
          </div>
          <p className="page-subtitle">
            Monitor real-time inventory levels, reorder alerts, and adjust stock quantities.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate("/purchases")}
            variant="outline"
            className="border-slate-200 text-slate-700 font-semibold gap-1.5"
          >
            Record Purchase Intake
          </Button>
          <Button
            onClick={() => navigate("/products")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New SKU
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Inventory Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-indigo-600">
            ₹{totalValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{totalUnits} total units in stock</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Active SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">{products.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Catalog items configured</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Low Stock Warning</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-amber-600">{lowStockItems.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Below reorder threshold</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Out of Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-rose-600">{outOfStockItems.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Immediate restock required</p>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="table-container">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by SKU, product name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All SKUs ({products.length})
            </button>
            <button
              onClick={() => setFilterTab("low")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "low"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-amber-700 hover:bg-amber-50"
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setFilterTab("out")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "out"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-rose-700 hover:bg-rose-50"
              }`}
            >
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Holding Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No matching products found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Check your search query or change filter tabs.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock <= p.minStock && !isOutOfStock;
                  const holdingValue = p.stock * p.price;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                        {p.batchNo && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            Batch: {p.batchNo}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 text-xs">
                        {p.stock} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400 text-xs font-medium">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-600">
                        ₹{p.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        ₹{holdingValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="out-of-stock-badge">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="low-stock-badge">Low Stock</span>
                        ) : (
                          <span className="in-stock-badge">Healthy</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustmentQty(10);
                            setAdjustType("add");
                          }}
                          className="h-8 text-xs font-semibold border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stock Adjustment Modal */}
      {adjustingProduct && (
        <Dialog open={true} onOpenChange={() => setAdjustingProduct(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Adjust Inventory Level
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900 text-sm">{adjustingProduct.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>SKU: <strong className="text-slate-700">{adjustingProduct.sku}</strong></span>
                  <span>•</span>
                  <span>Current: <strong className="text-slate-900">{adjustingProduct.stock} {adjustingProduct.unit}</strong></span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("add")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    adjustType === "add"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  + Add / Restock Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("set")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    adjustType === "set"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Set Absolute Quantity
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  {adjustType === "add" ? "Quantity to Add" : "New Total Stock Count"}
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setAdjustmentQty(Math.max(1, adjustmentQty - 5))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center font-bold text-base h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setAdjustmentQty(adjustmentQty + 5)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Resulting inventory will be:{" "}
                  <strong className="text-indigo-600 font-bold">
                    {adjustType === "add"
                      ? adjustingProduct.stock + adjustmentQty
                      : adjustmentQty}{" "}
                    {adjustingProduct.unit}(s)
                  </strong>
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setAdjustingProduct(null)}
                className="border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStockAdjustment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                Save Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
