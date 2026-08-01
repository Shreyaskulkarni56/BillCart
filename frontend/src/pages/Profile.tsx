import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Store, Receipt, MapPin, Phone, Mail, Building2, Hash, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { settings, updateSettings } = useApp();
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
    await updateSettings(formData);
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop Profile & Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your store details and invoice configuration.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        
        {/* Shop Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Store Information
            </CardTitle>
            <CardDescription>This information will appear on your printed invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter shop name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="+91..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="shop@example.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Invoice Settings Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN Number</Label>
                <Input
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="29AABC..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State Code</Label>
                  <Input
                    id="stateCode"
                    name="stateCode"
                    value={formData.stateCode}
                    onChange={handleChange}
                    placeholder="e.g. 29"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Invoice Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invoicePrefix"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    className="pl-9 font-mono"
                    placeholder="e.g. SLN"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  New invoices will be generated as {formData.invoicePrefix || "SLN"}0001, {formData.invoicePrefix || "SLN"}0002...
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Profile;
