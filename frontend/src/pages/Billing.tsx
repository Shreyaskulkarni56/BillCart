import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  ShoppingCart,
  AlertCircle,
  FileText,
  UserPlus,
  Sparkles,
  Percent,
  X,
  CheckCircle2,
  Package,
} from "lucide-react";
import InvoiceDialog from "../components/InvoiceDialog";
import { BillItem, categories, Product, Customer, Sale } from "../types";
import { toast } from "sonner";
import { savePaymentRecord } from "@/lib/paymentHelper";

const Billing: React.FC = () => {
  const {
    products,
    customers,
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    generateInvoice,
    addCustomer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [completedInvoice, setCompletedInvoice] = useState<Sale | null>(null);
  const [lastConfirmedPaymentMode, setLastConfirmedPaymentMode] = useState<string>("Credit (15-30 Days)");

  // Quick Customer Creation modal
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dlNo: "",
    gstinNo: "",
    balance: 0,
    totalPurchases: 0,
  });

  const allCategories = ["All", ...categories];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = cart.reduce((sum, item) => {
    const itemGst = item.gstRate || 5;
    const discountedItemTotal = item.total * (1 - discount / 100);
    return sum + Math.round((discountedItemTotal * (itemGst / 100)) * 100) / 100;
  }, 0);
  const grandTotal = taxableAmount + tax;

  const handleAddToCart = (product: Product) => {
    const qty = quantity[product.id] || 1;
    addToCart(product, qty);
    setQuantity({ ...quantity, [product.id]: 1 });
  };

  const handleOpenInvoice = () => {
    if (cart.length === 0) {
      toast.error("Please add products to the cart first.");
      return;
    }
    if (!selectedCustomer) {
      toast.error("Please select a customer for the invoice.");
      return;
    }
    setIsInvoiceOpen(true);
  };

  const handleConfirmInvoice = async (customItems?: BillItem[], paymentMode?: string) => {
    const mode = paymentMode || "Credit (15-30 Days)";
    setLastConfirmedPaymentMode(mode);
    const invoice = await generateInvoice(discount, customItems);
    if (invoice) {
      const isCredit = mode.startsWith("Credit");
      savePaymentRecord(invoice.id, {
        status: isCredit ? "pending" : "paid",
        mode: mode as any,
        referenceNo: isCredit ? `CR-${invoice.invoiceNo || invoice.id.slice(-6)}` : `${mode.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        settledDate: isCredit ? undefined : new Date().toISOString().split("T")[0],
        amountPaid: isCredit ? 0 : invoice.total,
        notes: `Payment mode selected at invoice creation: ${mode}`,
      });
      setIsInvoiceOpen(false);
      setDiscount(0);
      setCompletedInvoice(invoice);
    }
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast.error("Customer name and phone are required");
      return;
    }
    try {
      await addCustomer(newCustomerData);
      // Select customer
      const created = {
        id: "temp-" + Date.now(),
        ...newCustomerData,
      };
      setSelectedCustomer(created as Customer);
      setIsNewCustomerOpen(false);
      setNewCustomerData({
        name: "",
        phone: "",
        email: "",
        address: "",
        dlNo: "",
        gstinNo: "",
        balance: 0,
        totalPurchases: 0,
      });
      toast.success("Customer added and selected!");
    } catch (err: any) {
      toast.error("Failed to add customer");
    }
  };

  return (
    <div className="page-container h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Billing & POS Terminal</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              New Sale
            </Badge>
          </div>
          <p className="page-subtitle">
            Search items, build orders, apply tax deductions, and print professional GST invoices.
          </p>
        </div>

        {/* Mobile Cart Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            onClick={() => {
              document.getElementById("cart-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-indigo-600 text-white font-semibold gap-1.5 w-full sm:w-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Current Bill ({cart.length})</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog & Search (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="table-container p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search products by SKU, brand, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-slate-50/70 border-slate-200 text-sm focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Table */}
          <div className="table-container">
            <div className="table-scroll max-h-[560px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-200/80 bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-center">Add</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No products match your search</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try another category or term</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOutOfStock = p.stock === 0;
                      const isLowStock = p.stock <= p.minStock && !isOutOfStock;
                      const inCartItem = cart.find((i) => i.productId === p.id);
                      const currentQty = quantity[p.id] || 1;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                              {p.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                              <span>SKU: {p.sku}</span>
                              {p.batchNo && <span>• Batch: {p.batchNo}</span>}
                              {p.gstRate && <span>• GST: {p.gstRate}%</span>}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isOutOfStock ? (
                              <span className="out-of-stock-badge text-[10px] py-0.5">
                                Out
                              </span>
                            ) : isLowStock ? (
                              <span className="low-stock-badge text-[10px] py-0.5">
                                {p.stock} left
                              </span>
                            ) : (
                              <span className="in-stock-badge text-[10px] py-0.5">
                                {p.stock} {p.unit}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <p className="font-bold font-mono text-slate-900 text-xs">
                              ₹{p.price.toFixed(2)}
                            </p>
                            {p.mrp && p.mrp > p.price && (
                              <p className="text-[10px] text-slate-400 line-through font-mono">
                                ₹{p.mrp.toFixed(2)}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Input
                              type="number"
                              min={1}
                              max={p.stock}
                              disabled={isOutOfStock}
                              value={quantity[p.id] || 1}
                              onChange={(e) =>
                                setQuantity({
                                  ...quantity,
                                  [p.id]: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="w-14 h-8 text-center text-xs font-bold bg-white mx-auto"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Button
                              size="sm"
                              disabled={isOutOfStock}
                              onClick={() => handleAddToCart(p)}
                              className="h-8 px-3 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 transition-all shadow-none"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Add
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
        </div>

        {/* Right Column: Invoice Cart Summary (5 cols) */}
        <div id="cart-section" className="lg:col-span-5 space-y-4">
          <div className="table-container p-5 space-y-4">
            {/* Customer Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Bill To Customer *
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New Customer
                </button>
              </div>

              <Select
                value={selectedCustomer?.id || ""}
                onValueChange={(val) => {
                  const c = customers.find((cust) => cust.id === val);
                  setSelectedCustomer(c || null);
                }}
              >
                <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
                  <SelectValue placeholder="Select or search customer..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 max-h-56">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name} • {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCustomer && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{selectedCustomer.name}</span>
                    <span className="font-mono text-slate-600">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.address && (
                    <p className="text-[11px] text-slate-500 truncate">{selectedCustomer.address}</p>
                  )}
                  {selectedCustomer.gstinNo && (
                    <p className="text-[10px] text-indigo-700 font-mono font-semibold">
                      GSTIN: {selectedCustomer.gstinNo}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cart Header */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                Current Cart Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => clearCart()}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-medium text-xs text-slate-600">Cart is empty</p>
                  <p className="text-[11px] text-slate-400">Click "+ Add" on items to create invoice</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-xs truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                        className="h-7 w-7 rounded-lg border-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-xs font-mono">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                        className="h-7 w-7 rounded-lg border-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-right shrink-0 min-w-[60px]">
                      <p className="font-bold text-slate-900 text-xs font-mono">
                        ₹{item.total.toFixed(2)}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Discount selector & Bill Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Apply Discount</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscount(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        discount === d
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({discount}%)</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxable Value</span>
                  <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tax (GST)</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-extrabold text-sm text-slate-900">Grand Total</span>
                  <span className="text-xl font-extrabold font-mono text-indigo-600">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleOpenInvoice}
                disabled={cart.length === 0 || !selectedCustomer}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs rounded-xl gap-2"
              >
                <FileText className="w-4 h-4" />
                Preview & Confirm Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Dialog */}
      {isNewCustomerOpen && (
        <Dialog open={true} onOpenChange={() => setIsNewCustomerOpen(false)}>
          <DialogContent className="max-w-md bg-white border border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Quick Add Customer
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickAddCustomer} className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustomerData.name}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, name: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone *
                  </label>
                  <Input
                    required
                    placeholder="+91 98765 43210"
                    value={newCustomerData.phone}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, phone: e.target.value })
                    }
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    GSTIN No (Optional)
                  </label>
                  <Input
                    placeholder="29ABCDE1234F1Z5"
                    value={newCustomerData.gstinNo}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, gstinNo: e.target.value })
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Billing Address
                </label>
                <Input
                  placeholder="City, State, Pincode"
                  value={newCustomerData.address}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, address: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save & Select
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice Confirmation Dialog */}
      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        customer={selectedCustomer}
        items={cart}
        onUpdateItem={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onConfirm={handleConfirmInvoice}
        discount={discount}
        onDiscountChange={setDiscount}
      />

      {/* Generated Invoice Success Viewer with QR Code */}
      {completedInvoice && (
        <InvoiceDialog
          isOpen={true}
          onClose={() => setCompletedInvoice(null)}
          customer={
            customers.find((c) => c.id === completedInvoice.customerId) ||
            selectedCustomer ||
            ({
              name: completedInvoice.customerName,
              dlNo: completedInvoice.customerDlNo,
              gstinNo: completedInvoice.customerGstinNo,
            } as any)
          }
          items={completedInvoice.items as any}
          onUpdateItem={() => {}}
          onRemoveItem={() => {}}
          onConfirm={() => {}}
          discount={0}
          onDiscountChange={() => {}}
          isReadOnly={true}
          pastInvoiceNo={completedInvoice.invoiceNo}
          pastDate={completedInvoice.date}
          pastPaymentMode={lastConfirmedPaymentMode}
        />
      )}
    </div>
  );
};

export default Billing;

