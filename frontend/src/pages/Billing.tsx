import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Minus,
  Trash2,
  Receipt,
  User,
  ShoppingCart,
  AlertCircle,
  FileText,
} from "lucide-react";
import InvoiceDialog from "../components/InvoiceDialog";

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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * (gstRate / 100);
  const grandTotal = taxableAmount + tax;

  const handleAddToCart = (product: typeof products[0]) => {
    const qty = quantity[product.id] || 1;
    addToCart(product, qty);
    setQuantity({ ...quantity, [product.id]: 1 });
  };

  const handleOpenInvoice = () => {
    if (cart.length === 0) {
      alert("Please add items to the cart first.");
      return;
    }
    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }
    setIsInvoiceOpen(true);
  };

  const handleConfirmInvoice = async () => {
    const invoice = await generateInvoice(discount, gstRate);
    if (invoice) {
      setIsInvoiceOpen(false);
      setDiscount(0);
    }
  };

  return (
    <div className="page-container h-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">Create new invoice and manage orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:h-[calc(100%-4rem)]">
        {/* Product Search Section */}
        <div className="lg:col-span-2 table-container flex flex-col min-h-[300px] lg:min-h-0">
          {/* Customer Selection */}
          <div className="p-3 sm:p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3 sm:gap-4">
              <User className="w-5 h-5 text-muted-foreground shrink-0" />
              <Select
                value={selectedCustomer?.id || ""}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value);
                  setSelectedCustomer(customer || null);
                }}
              >
                <SelectTrigger className="w-full sm:max-w-sm">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 sm:p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-auto table-scroll">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Product</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Stock</th>
                  <th className="text-right p-3 sm:p-4 font-semibold text-muted-foreground text-sm hidden sm:table-cell">MRP</th>
                  <th className="text-right p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Price</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Qty</th>
                  <th className="text-center p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="p-3 sm:p-4">
                      <p className="font-medium text-foreground text-sm sm:text-base">{product.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{product.sku} • {product.category}</p>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <span
                        className={
                          product.stock === 0
                            ? "out-of-stock-badge"
                            : product.stock <= product.minStock
                              ? "low-stock-badge"
                              : "in-stock-badge"
                        }
                      >
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-right text-muted-foreground hidden sm:table-cell">₹{product.mrp ? product.mrp.toFixed(2) : '-'}</td>
                    <td className="p-3 sm:p-4 text-right font-medium text-sm sm:text-base">₹{product.price.toFixed(2)}</td>
                    <td className="p-3 sm:p-4">
                      <Input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={quantity[product.id] || 1}
                        onChange={(e) =>
                          setQuantity({
                            ...quantity,
                            [product.id]: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20 mx-auto text-center"
                        disabled={product.stock === 0}
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="h-8 px-2 sm:px-3"
                      >
                        <Plus className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart Section */}
        <div className="table-container flex flex-col min-h-[280px] lg:min-h-0">
          <div className="p-3 sm:p-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Current Bill</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {cart.length} items
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto divide-y">
            {cart.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to start billing</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">₹{item.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateCartItemQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateCartItemQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-auto text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary */}
          <div className="border-t p-4 bg-muted/30 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                GST Rate
                <Select
                  value={gstRate.toString()}
                  onValueChange={(val) => setGstRate(Number(val))}
                >
                  <SelectTrigger className="w-[70px] h-7 text-xs">
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
              </span>
              <span className="font-medium">₹{tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="font-bold text-xl text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">
            {!selectedCustomer && cart.length > 0 && (
              <div className="flex items-center gap-2 text-warning text-sm mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Please select a customer</span>
              </div>
            )}
            <Button
              className="w-full h-12 text-base"
              onClick={handleOpenInvoice}
              disabled={cart.length === 0 || !selectedCustomer}
            >
              <FileText className="w-5 h-5 mr-2" />
              Preview Invoice
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                clearCart();
                setDiscount(0);
              }}
              disabled={cart.length === 0}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Dialog */}
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
    </div>
  );
};

export default Billing;
