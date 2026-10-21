import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Receipt,
  MapPin,
  Phone,
  Mail,
  Building2,
  Hash,
  Save,
  User,
  ShieldCheck,
  CheckCircle2,
  Key,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const Profile: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    gstin: "",
    phone: "",
    email: "",
    state: "",
    stateCode: "",
    invoicePrefix: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || "",
        address: settings.address || "",
        gstin: settings.gstin || "",
        phone: settings.phone || "",
        email: settings.email || "",
        state: settings.state || "",
        stateCode: settings.stateCode || "",
        invoicePrefix: settings.invoicePrefix || "",
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success("Profile and store settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Store Profile & Credentials</h1>
            <span className="badge-pill bg-indigo-50 text-indigo-700 border-indigo-200">
              Account Admin
            </span>
          </div>
          <p className="page-subtitle">
            Manage your store identity, tax credentials, and default invoice sequence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-9 gap-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Authenticated User Banner Card */}
      {user && (
        <div className="mb-6 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{user.name}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Authorized Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs text-slate-500">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Tenant Store</span>
              <span className="font-medium text-slate-800">{user.shopName || formData.shopName || "Standard Store"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Account ID</span>
              <code className="font-mono text-slate-700 font-semibold">{user.id.slice(-8)}</code>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Store Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Store Information</h3>
                <p className="text-xs text-slate-500">
                  This official information will be printed on all invoices and receipts.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="shopName" className="text-xs font-semibold text-slate-700">
                  Store / Shop Name *
                </Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="e.g. Lakshmi Ayurveda Distributors"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                  Business Physical Address *
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, building, market, city, pincode..."
                  rows={3}
                  className="text-xs resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                    Official Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9 h-9 text-xs font-mono"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Official Support Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9 h-9 text-xs"
                      placeholder="billing@yourstore.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tax Details & Invoice Configuration */}
        <div className="space-y-6">
          {/* Tax Compliance Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Tax & Jurisdictions</h3>
                <p className="text-xs text-slate-500">Official GST credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gstin" className="text-xs font-semibold text-slate-700">
                  GSTIN Registration No.
                </Label>
                <Input
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="29AABCU9603R1ZM"
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-semibold text-slate-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Karnataka"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stateCode" className="text-xs font-semibold text-slate-700">
                    State Code *
                  </Label>
                  <Input
                    id="stateCode"
                    name="stateCode"
                    value={formData.stateCode}
                    onChange={handleChange}
                    placeholder="29"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Prefix Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Invoice Series</h3>
                <p className="text-xs text-slate-500">Document numbering format</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invoicePrefix" className="text-xs font-semibold text-slate-700">
                  Invoice Number Prefix *
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    id="invoicePrefix"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    className="pl-9 h-9 text-xs font-mono font-semibold uppercase"
                    placeholder="e.g. SLN"
                    required
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 text-xs">
                  <span className="text-slate-500 text-[11px] block">Next generated invoices:</span>
                  <div className="font-mono font-semibold text-indigo-600 text-xs mt-1">
                    {formData.invoicePrefix || "SLN"}0001, {formData.invoicePrefix || "SLN"}0002...
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save Store Profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
