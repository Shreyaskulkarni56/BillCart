import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  IndianRupee,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Receipt,
  Users,
  Plus,
  Truck,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Printer,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InvoiceDialog from "@/components/InvoiceDialog";
import { Sale } from "../types";

const Dashboard: React.FC = () => {
  const { products, sales, customers, getTodaysSales, getLowStockProducts, updateSaleDate } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const todaysSales = getTodaysSales();
  const todaysTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = getLowStockProducts();
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalCustomers = customers.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-container">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {greeting}, {user?.name?.split(" ")[0] || "Store Owner"}! 👋
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold text-[10px]">
              Active Store
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Here's what's happening at <strong className="text-slate-800">{user?.shopName || "Your Store"}</strong> today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate("/billing")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5 h-10 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold gap-1.5 h-10 px-3.5 rounded-xl"
          >
            <Package className="w-4 h-4 text-slate-500" />
            Add SKU
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/customers")}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold gap-1.5 h-10 px-3.5 rounded-xl hidden sm:inline-flex"
          >
            <Users className="w-4 h-4 text-slate-500" />
            New Customer
          </Button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Sales */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Today's Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-emerald-600">₹{todaysTotal.toFixed(2)}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>{todaysSales.length} bills generated</span>
            <span className="inline-flex items-center text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Live
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Products in Catalog</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="stat-value text-slate-900">{totalProducts}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>Active SKUs</span>
            <Link to="/products" className="text-indigo-600 hover:underline inline-flex items-center font-semibold">
              Browse <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="stat-card border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Low Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="stat-value text-amber-600">{lowStockProducts.length}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>Needs restocking</span>
            <Link to="/inventory" className="text-amber-700 hover:underline inline-flex items-center font-bold">
              Restock <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="stat-card border-rose-200/80 bg-gradient-to-b from-white to-rose-50/20">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Out of Stock</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="stat-value text-rose-600">{outOfStock}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
            <span>Unavailable SKUs</span>
            <Link to="/purchases" className="text-rose-700 hover:underline inline-flex items-center font-bold">
              Purchase <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Priority Table */}
        <div className="table-container flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
            <div>
              <h2 className="text-base font-bold text-slate-900">Low Stock Priority Alerts</h2>
              <p className="text-xs text-slate-500 font-medium">Items nearing replenishment threshold</p>
            </div>
            <Link to="/inventory">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-slate-200 hover:bg-slate-100">
                View Inventory <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-semibold text-slate-700">Healthy Inventory</p>
                <p className="text-xs text-slate-400 mt-0.5">All products are stocked above minimum thresholds.</p>
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-900 text-xs truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      SKU: <span className="font-mono text-slate-700">{product.sku}</span> • {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={
                          product.stock === 0 ? "out-of-stock-badge" : "low-stock-badge"
                        }
                      >
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} ${product.unit}`}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Min: {product.minStock} {product.unit}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/inventory")}
                      className="h-7 px-2.5 text-xs font-semibold border-slate-200 hover:text-indigo-600 hover:border-indigo-300"
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices & Sales Activity */}
        <div className="table-container flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Invoices</h2>
              <p className="text-xs text-slate-500 font-medium">Latest billing & transaction history</p>
            </div>
            <Link to="/invoices">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-slate-200 hover:bg-slate-100">
                All Invoices <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {sales.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No Sales Invoices Yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Create your first bill to see live transactions.</p>
              </div>
            ) : (
              sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 group-hover:underline">
                        {sale.invoiceNo || sale.id.substring(0, 8)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(sale.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs mt-0.5 truncate">
                      {sale.customerName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      ₹{sale.total.toFixed(2)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview when clicking recent transactions */}
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

export default Dashboard;
