import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpDown,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { Product, categories, getExpiryStatus, getDaysUntilExpiry } from "../types";
import { toast } from "sonner";

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "" as number | string,
    mrp: "" as number | string,
    stock: "" as number | string,
    minStock: 10 as number | string,
    unit: "Piece",
    sku: "",
    batchNo: "",
    hsnCode: "",
    gstRate: 12,
    expiryDate: "",
  });

  // Calculate expiry statistics
  const expiredProducts = products.filter((p) => getExpiryStatus(p.expiryDate) === "expired");
  const expiringSoonProducts = products.filter(
    (p) => getExpiryStatus(p.expiryDate) === "expiring-soon"
  );
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.batchNo || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        mrp: product.mrp || product.price,
        stock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
        sku: product.sku,
        batchNo: product.batchNo || "",
        hsnCode: product.hsnCode || "",
        gstRate: product.gstRate || 5,
        expiryDate: product.expiryDate || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: categories[0] || "Medicine",
        price: "",
        mrp: "",
        stock: "",
        minStock: 10,
        unit: "Piece",
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        batchNo: `BATCH-${Math.floor(100 + Math.random() * 900)}`,
        hsnCode: "3004",
        gstRate: 12,
        expiryDate: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...submissionData });
    } else {
      addProduct(submissionData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Product Catalog</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {products.length} SKUs
            </Badge>
          </div>
          <p className="page-subtitle">
            Manage your master list of medicines, wellness products, prices, and stock units.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5 h-10 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Metric Stat Pills */}
      <div className="flex flex-wrap gap-2.5">
        <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xs">
          <span className="text-slate-500 font-medium">Total Catalog:</span>
          <span className="font-extrabold text-slate-900">{products.length}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-slate-500 font-medium">Low Stock:</span>
          <span className="font-bold text-amber-600">{lowStockCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="text-slate-500 font-medium">Out of Stock:</span>
          <span className="font-bold text-rose-600">{outOfStockCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-slate-500 font-medium">Expiring Soon (90d):</span>
          <span className="font-bold text-orange-600">{expiringSoonProducts.length}</span>
        </div>
        {expiredProducts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span className="text-rose-700 font-semibold">Expired:</span>
            <span className="font-extrabold text-rose-700">{expiredProducts.length}</span>
          </div>
        )}
      </div>

      {/* Expiry Warning Callout */}
      {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
        <div className="space-y-2">
          {expiredProducts.length > 0 && (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200/70 rounded-xl flex items-start gap-3 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">
                  Critical: {expiredProducts.length} Expired Item(s)
                </p>
                <p className="text-rose-700 mt-0.5">
                  {expiredProducts.map((p) => p.name).join(", ")}
                </p>
              </div>
            </div>
          )}
          {expiringSoonProducts.length > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Notice: {expiringSoonProducts.length} Product(s) Expiring Within 90 Days
                </p>
                <p className="text-amber-700 mt-0.5">
                  {expiringSoonProducts
                    .map((p) => `${p.name} (${getDaysUntilExpiry(p.expiryDate)}d)`)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="table-container">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by name, SKU, category, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Batch / HSN</th>
                <th className="py-3 px-4 text-center">Expiry</th>
                <th className="py-3 px-4 text-right">MRP</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Click 'Add Product' to start building your catalog."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const expiryStatus = getExpiryStatus(product.expiryDate);
                  const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                        {product.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        <span>{product.batchNo || "—"}</span>
                        {product.hsnCode && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            HSN: {product.hsnCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs">
                        {product.expiryDate ? (
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-[11px] font-semibold ${
                                expiryStatus === "expired"
                                  ? "text-rose-600"
                                  : expiryStatus === "expiring-soon"
                                  ? "text-orange-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {new Date(product.expiryDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {expiryStatus === "expired" && (
                              <span className="text-[9px] font-bold text-rose-600 uppercase">
                                Expired
                              </span>
                            )}
                            {expiryStatus === "expiring-soon" && daysUntilExpiry !== null && (
                              <span className="text-[9px] font-bold text-orange-600">
                                {daysUntilExpiry}d left
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
                        ₹{(product.mrp || product.price).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        ₹{product.price.toFixed(2)}
                        {product.gstRate && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            +{product.gstRate}% GST
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                        {product.stock} {product.unit}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={
                            product.stock === 0
                              ? "out-of-stock-badge"
                              : product.stock <= product.minStock
                              ? "low-stock-badge"
                              : "in-stock-badge"
                          }
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock <= product.minStock
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(product)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingProduct ? "Edit Product Details" : "Add New SKU to Catalog"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Product / Medicine Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Ashwagandha Tablet 500mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku" className="text-xs font-semibold text-slate-700">
                  SKU / Item Code *
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="h-10 text-xs font-mono mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-semibold text-slate-700">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-10 text-xs bg-white mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mrp" className="text-xs font-semibold text-slate-700">
                  MRP (Maximum Retail Price ₹) *
                </Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.mrp}
                  onChange={(e) => {
                    const val = e.target.value;
                    const mrp = parseFloat(val);
                    const marginPrice = !isNaN(mrp) ? mrp / 1.25 : 0;
                    let gstDivisor = 1;
                    const rate = formData.gstRate;
                    if (rate === 12) gstDivisor = 1.12;
                    else if (rate === 5) gstDivisor = 1.05;
                    const sellingPrice = marginPrice ? (marginPrice / gstDivisor).toFixed(2) : "";
                    setFormData({ ...formData, mrp: val, price: sellingPrice });
                  }}
                  className="h-10 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
                  Selling Price (₹) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 text-xs mt-1 font-bold text-indigo-600"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit" className="text-xs font-semibold text-slate-700">
                  Unit Measurement *
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => setFormData({ ...formData, unit: val })}
                >
                  <SelectTrigger className="h-10 text-xs bg-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200">
                    {["Piece", "Strip", "Bottle", "Tube", "Box", "Pack", "Tin"].map((u) => (
                      <SelectItem key={u} value={u} className="text-xs">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gstRate" className="text-xs font-semibold text-slate-700">
                  GST Rate (%)
                </Label>
                <Select
                  value={formData.gstRate.toString()}
                  onValueChange={(val) => {
                    const newGst = parseFloat(val);
                    const mrp =
                      typeof formData.mrp === "string" ? parseFloat(formData.mrp) : formData.mrp;
                    const marginPrice = !isNaN(mrp) ? mrp / 1.25 : 0;
                    let gstDivisor = 1;
                    if (newGst === 12) gstDivisor = 1.12;
                    else if (newGst === 5) gstDivisor = 1.05;
                    const sellingPrice = marginPrice
                      ? (marginPrice / gstDivisor).toFixed(2)
                      : formData.price;
                    setFormData({ ...formData, gstRate: newGst, price: sellingPrice });
                  }}
                >
                  <SelectTrigger className="h-10 text-xs bg-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200">
                    {["0", "5", "12", "18", "28"].map((g) => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g}% GST
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="batchNo" className="text-xs font-semibold text-slate-700">
                  Batch Number
                </Label>
                <Input
                  id="batchNo"
                  placeholder="BATCH-102"
                  value={formData.batchNo}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  className="h-10 text-xs font-mono mt-1"
                />
              </div>

              <div>
                <Label htmlFor="hsnCode" className="text-xs font-semibold text-slate-700">
                  HSN / SAC Code
                </Label>
                <Input
                  id="hsnCode"
                  placeholder="3004"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  className="h-10 text-xs font-mono mt-1"
                />
              </div>

              <div>
                <Label htmlFor="stock" className="text-xs font-semibold text-slate-700">
                  Current Stock Units *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="h-10 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="minStock" className="text-xs font-semibold text-slate-700">
                  Low Stock Threshold *
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min={0}
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="h-10 text-xs mt-1"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="expiryDate" className="text-xs font-semibold text-slate-700">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="h-10 text-xs mt-1"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {editingProduct ? "Save Changes" : "Create Product SKU"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;

