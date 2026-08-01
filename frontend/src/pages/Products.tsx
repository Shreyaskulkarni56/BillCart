import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, Calendar } from "lucide-react";
import { Product, categories, getExpiryStatus, getDaysUntilExpiry } from "../types";

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
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
  const expiredProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'expired');
  const expiringSoonProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'expiring-soon');

  const filteredProducts = products.filter(
    (product) =>
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        category: "",
        price: "",
        mrp: "",
        stock: "",
        minStock: 10,
        unit: "Piece",
        sku: "",
        batchNo: "",
        hsnCode: "",
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Products</h1>
          <p className="text-xs sm:text-base text-muted-foreground">Manage your inventory</p>
        </div>
        <Button size="sm" onClick={() => handleOpenModal()} className="w-auto shrink-0 sm:hidden">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
        <Button size="lg" onClick={() => handleOpenModal()} className="hidden sm:flex w-auto shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
          <div className="px-3 py-1.5 bg-card rounded-lg border">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold">{products.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-warning/10 rounded-lg border border-warning/30">
            <span className="text-warning">Low Stock: </span>
            <span className="font-semibold text-warning">
              {products.filter((p) => p.stock <= p.minStock && p.stock > 0).length}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-destructive/10 rounded-lg border border-destructive/30">
            <span className="text-destructive">Out of Stock: </span>
            <span className="font-semibold text-destructive">
              {products.filter((p) => p.stock === 0).length}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-destructive/10 rounded-lg border border-destructive/30">
            <span className="text-destructive">Expired: </span>
            <span className="font-semibold text-destructive">
              {expiredProducts.length}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <span className="text-orange-600">Expiring Soon: </span>
            <span className="font-semibold text-orange-600">
              {expiringSoonProducts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
        <div className="mb-6 space-y-3">
          {expiredProducts.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Expired Products ({expiredProducts.length})</p>
                <p className="text-sm text-destructive/80">
                  {expiredProducts.map(p => p.name).join(', ')}
                </p>
              </div>
            </div>
          )}
          {expiringSoonProducts.length > 0 && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-600">Expiring Within 90 Days ({expiringSoonProducts.length})</p>
                <p className="text-sm text-orange-600/80">
                  {expiringSoonProducts.map(p => {
                    const days = getDaysUntilExpiry(p.expiryDate);
                    return `${p.name} (${days} days)`;
                  }).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Table */}
      <div className="table-container table-scroll">
        <table className="w-full lg:min-w-[900px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden sm:table-cell">SKU</th>
              <th className="text-left p-2 sm:p-4 font-semibold text-muted-foreground text-sm">Product Name</th>
              <th className="text-left p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden md:table-cell">Batch No</th>
              <th className="text-center p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden lg:table-cell">Expiry</th>
              <th className="text-left p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden lg:table-cell">HSN</th>
              <th className="text-left p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden sm:table-cell">Category</th>
              <th className="text-right p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden md:table-cell">MRP</th>
              <th className="text-right p-2 sm:p-4 font-semibold text-muted-foreground text-sm">Price</th>
              <th className="text-center p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden md:table-cell">GST%</th>
              <th className="text-center p-2 sm:p-4 font-semibold text-muted-foreground text-sm">Stock</th>
              <th className="text-center p-2 sm:p-4 font-semibold text-muted-foreground text-sm hidden sm:table-cell">Status</th>
              <th className="text-center p-2 sm:p-4 font-semibold text-muted-foreground text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const expiryStatus = getExpiryStatus(product.expiryDate);
                const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);

                return (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="p-2 sm:p-4 font-mono text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                      {product.sku}
                    </td>
                    <td className="p-2 sm:p-4">
                      <p className="font-medium text-foreground text-sm sm:text-base line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden truncate">{product.category}</p>
                    </td>
                    <td className="p-2 sm:p-4 font-mono text-sm text-muted-foreground hidden md:table-cell">
                      {product.batchNo || '-'}
                    </td>
                    <td className="p-2 sm:p-4 text-center hidden lg:table-cell">
                      {product.expiryDate ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-medium ${expiryStatus === 'expired' ? 'text-destructive' :
                            expiryStatus === 'expiring-soon' ? 'text-orange-600' :
                              'text-muted-foreground'
                            }`}>
                            {new Date(product.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          {expiryStatus === 'expired' && (
                            <span className="text-xs text-destructive font-semibold">EXPIRED</span>
                          )}
                          {expiryStatus === 'expiring-soon' && daysUntilExpiry !== null && (
                            <span className="text-xs text-orange-600">{daysUntilExpiry}d left</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 text-muted-foreground hidden lg:table-cell">{product.hsnCode || '-'}</td>
                    <td className="p-2 sm:p-4 text-muted-foreground hidden sm:table-cell">{product.category}</td>
                    <td className="p-2 sm:p-4 text-right font-medium hidden md:table-cell">₹{(product.mrp || product.price).toFixed(2)}</td>
                    <td className="p-2 sm:p-4 text-right font-medium text-sm sm:text-base">₹{product.price.toFixed(2)}</td>
                    <td className="p-2 sm:p-4 text-center text-muted-foreground hidden md:table-cell">{product.gstRate || 5}%</td>
                    <td className="p-2 sm:p-4 text-center text-sm">
                      {product.stock} <span className="hidden sm:inline">{product.unit}</span>
                    </td>
                    <td className="p-2 sm:p-4 text-center hidden sm:table-cell">
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
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleOpenModal(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-1 sm:col-span-2 md:col-span-3">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.mrp}
                  onChange={(e) => {
                    const val = e.target.value;
                    const mrp = parseFloat(val);

                    // Step 1: remove 20% margin
                    const marginPrice = !isNaN(mrp) ? mrp / 1.25 : 0;

                    // Step 2: remove GST
                    let gstDivisor = 1;
                    const rate = formData.gstRate;
                    if (rate === 12) gstDivisor = 1.12;
                    else if (rate === 5) gstDivisor = 1.05;

                    const sellingPrice = marginPrice ? (marginPrice / gstDivisor).toFixed(2) : "";

                    setFormData({ ...formData, mrp: val, price: sellingPrice });
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Strip">Strip</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Tube">Tube</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Tin">Tin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="batchNo">Batch No</Label>
                <Input
                  id="batchNo"
                  value={formData.batchNo}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNo: e.target.value })
                  }
                  placeholder="e.g., B123456"
                />
              </div>
              <div>
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={formData.hsnCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hsnCode: e.target.value })
                  }
                  placeholder="e.g., 3004"
                />
              </div>
              <div>
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Select
                  value={formData.gstRate.toString()}
                  onValueChange={(value) => {
                    const newGst = parseFloat(value);
                    const mrp = typeof formData.mrp === "string" ? parseFloat(formData.mrp) : formData.mrp;

                    // Step 1: remove margin
                    const marginPrice = !isNaN(mrp) ? mrp / 1.25 : 0;

                    // Step 2: remove GST
                    let gstDivisor = 1;
                    if (newGst === 12) gstDivisor = 1.12;
                    else if (newGst === 5) gstDivisor = 1.05;

                    const sellingPrice = marginPrice ? (marginPrice / gstDivisor).toFixed(2) : formData.price;

                    setFormData({ ...formData, gstRate: newGst, price: sellingPrice });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stock">Current Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min={0}
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
