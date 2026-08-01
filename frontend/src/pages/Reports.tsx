import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CalendarDays, TrendingUp, Receipt, IndianRupee, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import InvoiceDialog from "@/components/InvoiceDialog";
import { Sale } from "../types";

const COLORS = ["#2563eb", "#16a34a", "#ea580c", "#8b5cf6", "#ec4899", "#06b6d4"];

const Reports: React.FC = () => {
  const { sales, products, customers, updateSaleDate } = useApp();
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((sale) => {
    if (!dateRange?.from) return true;
    const saleDate = new Date(sale.date);
    const start = startOfDay(dateRange.from);
    const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    return saleDate >= start && saleDate <= end;
  });

  // Calculate sales by date
  const salesByDate = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, total: 0, count: 0 };
    }
    acc[date].total += sale.total;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; total: number; count: number }>);

  const dailyData = Object.values(salesByDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
    .reverse();

  // Calculate sales by category
  const salesByCategory = filteredSales.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += item.total;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Summary stats
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales analytics and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {dateRange?.from && (
            <Button variant="ghost" size="icon" onClick={() => setDateRange(undefined)} title="Clear filter">
              <X className="h-4 w-4" />
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-64 justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
          </div>
          <p className="stat-value">₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Transactions</span>
          </div>
          <p className="stat-value">{totalTransactions}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Avg. Transaction</span>
          </div>
          <p className="stat-value">₹{avgTransactionValue.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Tax (GST)</span>
          </div>
          <p className="stat-value">₹{totalTax.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="table-container p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Sales Trend</h3>
          {dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales by Category */}
        <div className="table-container p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value}`, "Sales"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="table-container table-scroll">
        <div className="p-4 sm:p-5 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Invoice #</th>
              <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground text-sm hidden sm:table-cell">Date</th>
              <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Customer</th>
              <th className="text-center p-3 sm:p-4 font-semibold text-muted-foreground text-sm hidden md:table-cell">Items</th>
              <th className="text-right p-3 sm:p-4 font-semibold text-muted-foreground text-sm hidden lg:table-cell">Subtotal</th>
              <th className="text-right p-3 sm:p-4 font-semibold text-muted-foreground text-sm hidden lg:table-cell">Tax</th>
              <th className="text-right p-3 sm:p-4 font-semibold text-muted-foreground text-sm">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found</p>
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedSale(sale)}>
                  <td className="p-3 sm:p-4 font-mono font-medium text-primary text-sm">{sale.invoiceNo}</td>
                  <td className="p-3 sm:p-4 text-muted-foreground text-sm hidden sm:table-cell">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="p-3 sm:p-4 font-medium text-sm">
                    {sale.customerName}
                    <p className="text-xs text-muted-foreground sm:hidden">{new Date(sale.date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3 sm:p-4 text-center hidden md:table-cell">{sale.items.length}</td>
                  <td className="p-3 sm:p-4 text-right hidden lg:table-cell">₹{sale.subtotal.toFixed(2)}</td>
                  <td className="p-3 sm:p-4 text-right text-muted-foreground hidden lg:table-cell">
                    ₹{sale.tax.toFixed(2)}
                  </td>
                  <td className="p-3 sm:p-4 text-right font-bold">
                    ₹{sale.total.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {selectedSale && (
        <InvoiceDialog
          isOpen={true}
          onClose={() => setSelectedSale(null)}
          customer={customers.find(c => c.id === selectedSale.customerId) || { name: selectedSale.customerName } as any}
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
