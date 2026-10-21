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
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Receipt,
  FileText,
} from "lucide-react";
import { Customer } from "../types";
import { toast } from "sonner";

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    dlNo: "",
    gstinNo: "",
    balance: 0,
    totalPurchases: 0,
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone || "").includes(searchQuery) ||
      (customer.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.dlNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.gstinNo || customer.gstin || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalPurchasesVolume = customers.reduce(
    (sum, c) => sum + (c.totalPurchases || 0),
    0
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
        dlNo: customer.dlNo || "",
        gstinNo: customer.gstinNo || customer.gstin || "",
        balance: customer.balance || 0,
        totalPurchases: customer.totalPurchases || 0,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        dlNo: "",
        gstinNo: "",
        balance: 0,
        totalPurchases: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone number are required");
      return;
    }
    try {
      if (editingCustomer) {
        await updateCustomer({ ...editingCustomer, ...formData });
        toast.success(`Updated details for ${formData.name}`);
      } else {
        await addCustomer(formData);
        toast.success(`Customer ${formData.name} added successfully!`);
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error("Failed to save customer details");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove customer ${name}?`)) {
      deleteCustomer(id);
      toast.success("Customer removed");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Customer Directory</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {customers.length} Profiles
            </Badge>
          </div>
          <p className="page-subtitle">
            Manage client profiles, GSTIN identifiers, Drug License (DL) credentials, and credit limits.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5 h-10 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Registered Clients</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-slate-900">{customers.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">B2B & Retail Clients</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Lifetime Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="stat-value text-emerald-600">
            ₹{totalPurchasesVolume.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Accumulated invoice billing</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Outstanding Credit Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="stat-value text-amber-600">
            ₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Across all accounts</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by name, phone, email, DL No, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Card View
            </button>
          </div>
        </div>

        {/* View Mode: Table */}
        {viewMode === "table" ? (
          <div className="table-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Billing Address</th>
                  <th className="py-3 px-4">Tax & DL Credentials</th>
                  <th className="py-3 px-4 text-right">Lifetime Total</th>
                  <th className="py-3 px-4 text-right">Credit Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No customers found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {searchQuery
                          ? "Try searching another name or phone number"
                          : "Add your first customer to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors truncate">
                              {c.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-mono font-medium text-slate-800">
                          {c.phone}
                        </p>
                        {c.email && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {c.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate">
                        {c.address || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {c.gstinNo || c.gstin ? (
                          <span className="block text-[11px] text-indigo-700 font-semibold">
                            GSTIN: {c.gstinNo || c.gstin}
                          </span>
                        ) : null}
                        {c.dlNo && (
                          <span className="block text-[10px] text-slate-500">
                            DL: {c.dlNo}
                          </span>
                        )}
                        {!c.gstinNo && !c.gstin && !c.dlNo && (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-slate-800">
                        ₹{(c.totalPurchases || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                            (c.balance || 0) > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          }`}
                        >
                          ₹{(c.balance || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(c)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode: Cards */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                        {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                          {c.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{c.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(c)}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    {c.email && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    )}
                    {(c.gstinNo || c.gstin) && (
                      <div className="text-[11px] font-mono text-indigo-700 font-semibold pt-1">
                        GSTIN: {c.gstinNo || c.gstin}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Purchases
                      </p>
                      <p className="font-bold font-mono text-slate-800">
                        ₹{(c.totalPurchases || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Balance
                      </p>
                      <p
                        className={`font-bold font-mono ${
                          (c.balance || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        ₹{(c.balance || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingCustomer ? "Edit Customer Record" : "Add New Customer Profile"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
            <div>
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Customer Name / Enterprise *
              </Label>
              <Input
                id="name"
                placeholder="e.g. Ramesh Kumar / Sri Sai Medicals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 text-xs mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-10 text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                Billing Address
              </Label>
              <Input
                id="address"
                placeholder="Shop 12, Main Road, Bengaluru, Karnataka"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="h-10 text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dlNo" className="text-xs font-semibold text-slate-700">
                  Drug License No (D.L. No)
                </Label>
                <Input
                  id="dlNo"
                  placeholder="e.g. KA-B1-12345"
                  value={formData.dlNo}
                  onChange={(e) => setFormData({ ...formData, dlNo: e.target.value })}
                  className="h-10 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gstinNo" className="text-xs font-semibold text-slate-700">
                  GSTIN Number
                </Label>
                <Input
                  id="gstinNo"
                  placeholder="29ABCDE1234F1Z5"
                  value={formData.gstinNo}
                  onChange={(e) => setFormData({ ...formData, gstinNo: e.target.value })}
                  className="h-10 text-xs font-mono mt-1 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="balance" className="text-xs font-semibold text-slate-700">
                  Credit Due Balance (₹)
                </Label>
                <Input
                  id="balance"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
                  }
                  className="h-10 text-xs mt-1 font-mono"
                />
              </div>
              {editingCustomer && (
                <div>
                  <Label htmlFor="totalPurchases" className="text-xs font-semibold text-slate-700">
                    Total Purchases (₹)
                  </Label>
                  <Input
                    id="totalPurchases"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.totalPurchases}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPurchases: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-10 text-xs mt-1 font-mono"
                  />
                </div>
              )}
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
                {editingCustomer ? "Update Customer" : "Save Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;

