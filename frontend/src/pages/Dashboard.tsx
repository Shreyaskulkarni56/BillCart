import React from "react";
import { useApp } from "../context/AppContext";
import {
  IndianRupee,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Receipt,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard: React.FC = () => {
  const { products, sales, getTodaysSales, getLowStockProducts } = useApp();

  const todaysSales = getTodaysSales();
  const todaysTotal = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = getLowStockProducts();
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
        {/* Today's Sales */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
              Today
            </span>
          </div>
          <p className="stat-value">₹{todaysTotal.toFixed(2)}</p>
          <p className="stat-label">Today's Sales</p>
          <p className="text-xs text-muted-foreground mt-1">{todaysSales.length} transactions</p>
        </div>

        {/* Total Products */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Total Products</p>
          <p className="text-xs text-muted-foreground mt-1">In inventory</p>
        </div>

        {/* Low Stock Alert */}
        <div className="stat-card border-warning/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                Alert
              </span>
            )}
          </div>
          <p className="stat-value">{lowStockProducts.length}</p>
          <p className="stat-label">Low Stock Items</p>
          <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
        </div>

        {/* Out of Stock */}
        <div className="stat-card border-destructive/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-destructive" />
            </div>
            {outOfStock > 0 && (
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                Critical
              </span>
            )}
          </div>
          <p className="stat-value">{outOfStock}</p>
          <p className="stat-label">Out of Stock</p>
          <p className="text-xs text-muted-foreground mt-1">Unavailable products</p>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="table-container">
          <div className="p-4 sm:p-5 border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Low Stock Alerts</h2>
                <p className="text-sm text-muted-foreground">Products that need restocking</p>
              </div>
              <Link to="/products">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>All products are well-stocked!</p>
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={
                        product.stock === 0 ? "out-of-stock-badge" : "low-stock-badge"
                      }
                    >
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: {product.minStock} {product.unit}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="table-container">
          <div className="p-4 sm:p-5 border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Transactions</h2>
                <p className="text-sm text-muted-foreground">Latest sales activity</p>
              </div>
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{sale.id}</p>
                    <p className="text-sm text-muted-foreground">{sale.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{sale.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <Link to="/billing" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 sm:h-14 px-6 w-full sm:w-auto">
              <Receipt className="w-5 h-5 mr-2" />
              New Bill
            </Button>
          </Link>
          <Link to="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 w-full sm:w-auto">
              <Package className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </Link>
          <Link to="/customers" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 w-full sm:w-auto">
              <Users className="w-5 h-5 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
