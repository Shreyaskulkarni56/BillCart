import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CalendarDays,
  TrendingUp,
  Receipt,
  IndianRupee,
  X,
  Download,
  Search,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import InvoiceDialog from "@/components/InvoiceDialog";
import { Sale } from "../types";
import { toast } from "sonner";

const CATEGORY_COLORS = ["#4338ca", "#0284c7", "#0d9488", "#16a34a", "#e11d48", "#d97706", "#7c3aed"];

const Reports: React.FC = () => {
  const { sales, products, customers, updateSaleDate } = useApp();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Date range presets
  const handlePresetSelect = (preset: "today" | "7days" | "30days" | "thisMonth" | "all") => {
    setActivePreset(preset);
    const now = new Date();
    if (preset === "all") {
      setDateRange(undefined);
    } else if (preset === "today") {
      setDateRange({ from: startOfDay(now), to: endOfDay(now) });
    } else if (preset === "7days") {
      setDateRange({ from: startOfDay(subDays(now, 6)), to: endOfDay(now) });
    } else if (preset === "30days") {
      setDateRange({ from: startOfDay(subDays(now, 29)), to: endOfDay(now) });
    } else if (preset === "thisMonth") {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  };

  // Filter sales by date range
  const dateFilteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!dateRange?.from) return true;
      const saleDate = new Date(sale.date);
      const start = startOfDay(dateRange.from);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, dateRange]);

  // Filter sales additionally by search query
  const displaySales = useMemo(() => {
    if (!searchQuery.trim()) return dateFilteredSales;
    const query = searchQuery.toLowerCase();
    return dateFilteredSales.filter(
      (s) =>
        s.invoiceNo.toLowerCase().includes(query) ||
        s.customerName.toLowerCase().includes(query)
    );
  }, [dateFilteredSales, searchQuery]);

  // Aggregate sales by date for Trend Chart
  const dailyData = useMemo(() => {
    const salesByDate = dateFilteredSales.reduce((acc, sale) => {
      const dateKey = new Date(sale.date).toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, total: 0, count: 0 };
      }
      acc[dateKey].total += sale.total;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

    return Object.values(salesByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [dateFilteredSales]);

  // Aggregate sales by category for Donut Chart
  const categoryData = useMemo(() => {
    const salesByCategory = dateFilteredSales.reduce((acc, sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const category = product?.category || "Other";
        acc[category] = (acc[category] || 0) + item.total;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByCategory)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value);
  }, [dateFilteredSales, products]);

  // KPI Calculations
  const totalRevenue = dateFilteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = dateFilteredSales.length;
  const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalGst = dateFilteredSales.reduce((sum, sale) => sum + sale.tax, 0);

  // CSV Export handler
  const handleExportCSV = () => {
    if (dateFilteredSales.length === 0) {
      toast.error("No transactions to export for the selected date range.");
      return;
    }

    const headers = ["Invoice No", "Date", "Customer Name", "Customer GSTIN", "Items Count", "Subtotal (INR)", "Tax GST (INR)", "Total Amount (INR)"];
    const rows = dateFilteredSales.map((s) => [
      s.invoiceNo,
      new Date(s.date).toISOString().split("T")[0],
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.customerGstinNo || "N/A",
      s.items.length,
      s.subtotal.toFixed(2),
      s.tax.toFixed(2),
      s.total.toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${dateFilteredSales.length} transaction records to CSV.`);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Reports & Analytics</h1>
            <span className="badge-pill bg-indigo-50 text-indigo-700 border-indigo-200">
              Live Insights
            </span>
          </div>
          <p className="page-subtitle">
            Track business growth, GST liabilities, sales trends, and category distribution.
          </p>
        </div>

        {/* Date Filter Toolbar & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Preset Buttons */}
          <div className="hidden sm:inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => handlePresetSelect("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePreset === "all" ? "bg-white text-foreground shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handlePresetSelect("today")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePreset === "today" ? "bg-white text-foreground shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetSelect("7days")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePreset === "7days" ? "bg-white text-foreground shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handlePresetSelect("thisMonth")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePreset === "thisMonth" ? "bg-white text-foreground shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Month
            </button>
          </div>

          {/* Date Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-normal border-slate-200 bg-white">
                <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, yyyy")
                  )
                ) : (
                  <span>Custom Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white shadow-lg border border-slate-200" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setActivePreset("custom");
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {dateRange && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-slate-600"
              onClick={() => handlePresetSelect("all")}
              title="Reset date filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Revenue</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="stat-value">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 inline" />
            Net invoiced revenue in selected period
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Invoices</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="stat-value">{totalTransactions}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Processed transactions</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Average Ticket Size</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="stat-value">₹{avgTicket.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Average invoice value</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total GST Tax</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="stat-value">₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">CGST & SGST liability</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
                <p className="text-xs text-slate-500">Daily gross sales volume</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Last {dailyData.length} active days
            </span>
          </div>

          {dailyData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-10 h-10 mb-2 opacity-30 stroke-[1.5]" />
              <p className="text-sm">No sales records for selected timeframe</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => {
                    const parts = val.split("-");
                    return `${parts[1]}/${parts[2]}`;
                  }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`₹${val.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Bar dataKey="total" fill="#4338ca" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Sales by Category</h3>
                <p className="text-xs text-slate-500">Product category revenue split</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {categoryData.length} categories
            </span>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <PieIcon className="w-10 h-10 mb-2 opacity-30 stroke-[1.5]" />
              <p className="text-sm">No category distribution available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, "Sales"]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transaction Details Ledger */}
      <div className="table-container">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Report Invoices Breakdown</h3>
            <p className="text-xs text-slate-500">Showing {displaySales.length} invoices matching active criteria</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice or customer..."
              className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 pl-5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5 text-center">Items</th>
                <th className="p-3.5 text-right">Taxable Subtotal</th>
                <th className="p-3.5 text-right">GST Tax</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displaySales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try widening the date range or clear search</p>
                  </td>
                </tr>
              ) : (
                displaySales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-5 font-mono font-semibold text-indigo-600">
                      {sale.invoiceNo}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(sale.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{sale.customerName}</div>
                      {sale.customerGstinNo && (
                        <span className="text-[10px] font-mono text-slate-400">GSTIN: {sale.customerGstinNo}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {sale.items.length} {sale.items.length === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      ₹{sale.subtotal.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      ₹{sale.tax.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{sale.total.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center pr-5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSale(sale);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
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

export default Reports;
