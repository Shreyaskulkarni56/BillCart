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
import { Search, Plus, Edit, Trash2, Users, Phone, Mail, MapPin } from "lucide-react";
import { Customer } from "../types";

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    balance: 0,
    totalPurchases: 0,
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone || "").includes(searchQuery) ||
      (customer.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        balance: customer.balance,
        totalPurchases: customer.totalPurchases,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...formData });
    } else {
      addCustomer(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button size="lg" onClick={() => handleOpenModal()} className="w-full sm:w-auto shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="px-3 py-1.5 bg-card rounded-lg border">
          <span className="text-muted-foreground">Total Customers: </span>
          <span className="font-semibold">{customers.length}</span>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-lg border">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {customer.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{customer.id}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenModal(customer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Total Purchases</p>
                  <p className="font-semibold text-foreground">
                    ₹{(customer.totalPurchases || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Credit Balance</p>
                  <p
                    className={`font-semibold ${customer.balance > 0 ? "text-warning" : "text-success"
                      }`}
                  >
                    ₹{(customer.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="balance">Credit Balance (₹)</Label>
                <Input
                  id="balance"
                  type="number"
                  min={0}
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              {editingCustomer && (
                <div>
                  <Label htmlFor="totalPurchases">Total Purchases (₹)</Label>
                  <Input
                    id="totalPurchases"
                    type="number"
                    min={0}
                    value={formData.totalPurchases}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPurchases: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
