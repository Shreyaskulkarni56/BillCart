import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Receipt,
  CreditCard,
  Percent,
  Save,
  RotateCcw,
  Store,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Printer,
  QrCode,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lock,
  Upload,
  Trash2,
  Camera,
  ImageIcon,
  Eye,
  Maximize2,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LiveInvoicePreview from "@/components/LiveInvoicePreview";

const Settings: React.FC = () => {
  const { settings, updateSettings, uploadLogo, removeLogo } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("business-profile");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Business Profile
    shopName: "",
    companyName: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    stateCode: "",
    country: "India",
    pincode: "",
    website: "",
    logoUrl: "",
    pan: "",
    defaultCurrency: "INR",

    // Invoice Templates & Branding
    invoicePrefix: "",
    startingInvoiceNumber: 1001,
    paperSize: "A4",
    templateTheme: "modern",
    showLogo: true,
    customTerms: "",
    primaryColor: "#4f46e5",
    logoPosition: "left" as "left" | "center" | "right",
    showTagline: true,
    showGstinInHeader: true,
    showCompanyAddress: true,
    showContactDetails: true,

    // Payment Details
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
    showQrCode: true,
    paymentInstructions: "",
    defaultPaymentTerms: "Due on Receipt",
    acceptedPaymentMethods: ["Cash", "UPI", "Card", "Net Banking"],

    // Tax & GST
    gstin: "",
    defaultGstRate: 12,
    taxType: "exclusive",
    isComposition: false,
    defaultHsn: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData({
        // Business Profile
        shopName: settings.shopName || "",
        companyName: settings.companyName || settings.shopName || "LAKSHMI AYURVEDA Distributors Pvt Ltd",
        tagline: settings.tagline || "Quality Ayurvedic Products & Wellness",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "Bengaluru",
        state: settings.state || "Karnataka",
        stateCode: settings.stateCode || "29",
        country: settings.country || "India",
        pincode: settings.pincode || "560001",
        website: settings.website || "https://lakshmiayurveda.com",
        logoUrl: settings.logoUrl || "",
        pan: settings.pan || "AABCU9603R",
        defaultCurrency: settings.defaultCurrency || "INR",

        // Invoice Templates & Branding
        invoicePrefix: settings.invoicePrefix || "SLN",
        startingInvoiceNumber: settings.startingInvoiceNumber || 1001,
        paperSize: settings.paperSize || "A4",
        templateTheme: settings.templateTheme || "modern",
        showLogo: settings.showLogo !== undefined ? settings.showLogo : true,
        customTerms: settings.customTerms || "1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction.\n3. Thank you for your business!",
        primaryColor: settings.primaryColor || "#4f46e5",
        logoPosition: (settings.logoPosition as "left" | "center" | "right") || "left",
        showTagline: settings.showTagline !== undefined ? settings.showTagline : true,
        showGstinInHeader: settings.showGstinInHeader !== undefined ? settings.showGstinInHeader : true,
        showCompanyAddress: settings.showCompanyAddress !== undefined ? settings.showCompanyAddress : true,
        showContactDetails: settings.showContactDetails !== undefined ? settings.showContactDetails : true,

        // Payment Details
        bankName: settings.bankName || "State Bank of India",
        accountHolder: settings.accountHolder || "Lakshmi Ayurveda Distributors",
        accountNumber: settings.accountNumber || "389201002938",
        ifscCode: settings.ifscCode || "SBIN0001234",
        branchName: settings.branchName || "Indiranagar Branch, Bengaluru",
        upiId: settings.upiId || "lakshmiayurveda@upi",
        showQrCode: settings.showQrCode !== undefined ? settings.showQrCode : true,
        paymentInstructions: settings.paymentInstructions || "Please share payment reference ID / UTR number via WhatsApp +91 9876543210 for instant dispatch verification.",
        defaultPaymentTerms: settings.defaultPaymentTerms || "Due on Receipt",
        acceptedPaymentMethods: settings.acceptedPaymentMethods || ["Cash", "UPI", "Card", "Net Banking"],

        // Tax & GST
        gstin: settings.gstin || "",
        defaultGstRate: settings.defaultGstRate || 12,
        taxType: settings.taxType || "exclusive",
        isComposition: settings.isComposition || false,
        defaultHsn: settings.defaultHsn || "30049011",
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData((prev) => {
      const current = prev.acceptedPaymentMethods || [];
      const updated = current.includes(method)
        ? current.filter((m) => m !== method)
        : [...current, method];
      return { ...prev, acceptedPaymentMethods: updated };
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "Invalid Image Format",
        description: "Allowed file formats: PNG, JPEG, WEBP, GIF, and SVG.",
        variant: "destructive",
      });
      return;
    }

    // File size validation (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Limit Exceeded",
        description: "Logo file size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setIsUploadingLogo(true);
      try {
        await uploadLogo(dataUrl);
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
      } catch (err) {
        // Handled in context
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    setIsUploadingLogo(true);
    try {
      await removeLogo();
      setFormData((prev) => ({ ...prev, logoUrl: "" }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      // Handled in context
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const name = formData.companyName || formData.shopName;
    if (!name || name.trim() === "") {
      errors.companyName = "Company / Store name is required";
    }

    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Invalid email format";
      }
    }

    if (formData.gstin && formData.gstin.trim() !== "") {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(formData.gstin.toUpperCase())) {
        errors.gstin = "Invalid GSTIN format (e.g. 29AABCU9603R1ZM)";
      }
    }

    if (formData.pan && formData.pan.trim() !== "") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan.toUpperCase())) {
        errors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        shopName: formData.companyName || formData.shopName,
      };
      await updateSettings(payload);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save settings. Please try again.";
      toast({
        title: "Save Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || "",
        companyName: settings.companyName || settings.shopName || "",
        tagline: settings.tagline || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        stateCode: settings.stateCode || "",
        country: settings.country || "India",
        pincode: settings.pincode || "",
        website: settings.website || "",
        logoUrl: settings.logoUrl || "",
        pan: settings.pan || "",
        defaultCurrency: settings.defaultCurrency || "INR",

        invoicePrefix: settings.invoicePrefix || "SLN",
        startingInvoiceNumber: settings.startingInvoiceNumber || 1001,
        paperSize: settings.paperSize || "A4",
        templateTheme: settings.templateTheme || "modern",
        showLogo: settings.showLogo !== undefined ? settings.showLogo : true,
        customTerms: settings.customTerms || "",
        primaryColor: settings.primaryColor || "#4f46e5",
        logoPosition: (settings.logoPosition as "left" | "center" | "right") || "left",
        showTagline: settings.showTagline !== undefined ? settings.showTagline : true,
        showGstinInHeader: settings.showGstinInHeader !== undefined ? settings.showGstinInHeader : true,
        showCompanyAddress: settings.showCompanyAddress !== undefined ? settings.showCompanyAddress : true,
        showContactDetails: settings.showContactDetails !== undefined ? settings.showContactDetails : true,

        bankName: settings.bankName || "",
        accountHolder: settings.accountHolder || "",
        accountNumber: settings.accountNumber || "",
        ifscCode: settings.ifscCode || "",
        branchName: settings.branchName || "",
        upiId: settings.upiId || "",
        showQrCode: settings.showQrCode !== undefined ? settings.showQrCode : true,
        paymentInstructions: settings.paymentInstructions || "",
        defaultPaymentTerms: settings.defaultPaymentTerms || "Due on Receipt",
        acceptedPaymentMethods: settings.acceptedPaymentMethods || ["Cash", "UPI"],

        gstin: settings.gstin || "",
        defaultGstRate: settings.defaultGstRate || 12,
        taxType: settings.taxType || "exclusive",
        isComposition: settings.isComposition || false,
        defaultHsn: settings.defaultHsn || "",
      });
      toast({
        title: "Form Reset",
        description: "Restored form fields to saved settings.",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sidebar-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-sidebar-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Settings</h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Protected Module
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure business identity, invoice generation rules, payment gateways, and tax parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} type="button" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Settings Form with Tabs */}
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/80 rounded-xl gap-1">
            <TabsTrigger
              value="business-profile"
              className="flex items-center gap-2 py-3 px-3 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Business Profile</span>
            </TabsTrigger>

            <TabsTrigger
              value="invoice-templates"
              className="flex items-center gap-2 py-3 px-3 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Receipt className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Invoice Templates</span>
            </TabsTrigger>

            <TabsTrigger
              value="payment-details"
              className="flex items-center gap-2 py-3 px-3 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Payment Details</span>
            </TabsTrigger>

            <TabsTrigger
              value="tax-gst"
              className="flex items-center gap-2 py-3 px-3 text-xs md:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Percent className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">Tax & GST</span>
            </TabsTrigger>
          </TabsList>

          {/* SECTION 1: BUSINESS PROFILE */}
          <TabsContent value="business-profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Company Logo Upload Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Camera className="w-5 h-5 text-primary" />
                      Company Branding & Logo
                    </CardTitle>
                    <CardDescription>
                      Upload your official company logo to be printed on receipts, invoices, and headers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Image Preview Box */}
                      <div className="relative group w-28 h-28 rounded-2xl border-2 border-dashed border-sidebar-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.logoUrl ? (
                          <img
                            src={formData.logoUrl}
                            alt="Company Logo"
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                            <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                            <span className="text-[10px] font-medium">No Logo</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-center sm:text-left flex-1">
                        <div>
                          <h4 className="text-sm font-semibold">Store Emblem / Brand Logo</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Allowed formats: <span className="font-mono text-foreground font-medium">PNG, JPG, WEBP, SVG</span>. Max size: <span className="font-mono text-foreground font-medium">5 MB</span>.
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                          onChange={handleLogoFileChange}
                          className="hidden"
                          id="logo-upload-input"
                        />

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingLogo}
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {formData.logoUrl ? "Replace Logo" : "Upload Logo"}
                          </Button>

                          {formData.logoUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isUploadingLogo}
                              onClick={handleRemoveLogo}
                              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Logo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="w-5 h-5 text-primary" />
                      Company & Store Identification
                    </CardTitle>
                    <CardDescription>
                      Primary store profile details displayed on billings, receipts, and invoices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company / Store Name *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. LAKSHMI AYURVEDA Distributors Pvt Ltd"
                          className={formErrors.companyName ? "border-destructive focus-visible:ring-destructive" : ""}
                          required
                        />
                        {formErrors.companyName && (
                          <p className="text-xs text-destructive">{formErrors.companyName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Store Tagline / Slogan</Label>
                        <Input
                          id="tagline"
                          name="tagline"
                          value={formData.tagline}
                          onChange={handleChange}
                          placeholder="e.g. Quality Ayurvedic Products & Wellness"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-9"
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-9 ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            placeholder="contact@store.com"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-xs text-destructive">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="pl-9"
                          placeholder="https://yourstore.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      Physical Address & Regional Settings
                    </CardTitle>
                    <CardDescription>Official business location and primary currency.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Building No, Street, Landmark..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Bengaluru"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="e.g. Karnataka"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="e.g. India"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN / Postal Code</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="560001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                        <Select
                          value={formData.defaultCurrency}
                          onValueChange={(val) => handleSelectChange("defaultCurrency", val)}
                        >
                          <SelectTrigger id="defaultCurrency">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹ - Indian Rupee)</SelectItem>
                            <SelectItem value="USD">USD ($ - US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (€ - Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (£ - British Pound)</SelectItem>
                            <SelectItem value="AED">AED (AED - UAE Dirham)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      Tax & Legal Registrations
                    </CardTitle>
                    <CardDescription>Government tax identification numbers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN Identification Number</Label>
                        <Input
                          id="gstin"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleChange}
                          placeholder="29AABCU9603R1ZM"
                          className={`font-mono uppercase ${formErrors.gstin ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {formErrors.gstin && (
                          <p className="text-xs text-destructive">{formErrors.gstin}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number (Permanent Account Number)</Label>
                        <Input
                          id="pan"
                          name="pan"
                          value={formData.pan}
                          onChange={handleChange}
                          placeholder="ABCDE1234F"
                          className={`font-mono uppercase ${formErrors.pan ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {formErrors.pan && (
                          <p className="text-xs text-destructive">{formErrors.pan}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Preview */}
              <div className="space-y-6">
                <Card className="bg-muted/40 border-muted">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Store Header Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-background rounded-xl border border-border space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                          {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-1" />
                          ) : (
                            (formData.companyName || formData.shopName) ? (formData.companyName || formData.shopName).charAt(0) : "S"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm leading-snug truncate">
                            {formData.companyName || formData.shopName || "Store Name"}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {formData.tagline || "Tagline goes here"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="text-xs space-y-1.5 text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          {formData.address || "Address"} {formData.city ? `, ${formData.city}` : ""}{" "}
                          {formData.state ? `, ${formData.state}` : ""} {formData.country ? `, ${formData.country}` : ""}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                          {formData.phone || "+91..."}
                        </p>
                        {formData.email && (
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                            {formData.email}
                          </p>
                        )}
                        {formData.gstin && (
                          <div className="pt-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground">GSTIN:</span>
                            <span className="font-mono">{formData.gstin}</span>
                          </div>
                        )}
                        {formData.pan && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground">PAN:</span>
                            <span className="font-mono">{formData.pan}</span>
                          </div>
                        )}
                        {formData.defaultCurrency && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground">Currency:</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {formData.defaultCurrency}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SECTION 2: INVOICE TEMPLATES */}
          <TabsContent value="invoice-templates" className="space-y-6">
            
            {/* Template Selection Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" /> Invoice Template Gallery
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a default visual layout for printed invoices and downloadable PDFs.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-primary/30 text-primary bg-primary/10">
                  Active: {formData.templateTheme === "professional" || formData.templateTheme === "standard" ? "Professional" : formData.templateTheme === "minimal" || formData.templateTheme === "compact" ? "Minimal" : "Modern"}
                </Badge>
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: MODERN TEMPLATE */}
              <div
                onClick={() => handleSelectChange("templateTheme", "modern")}
                className={`group cursor-pointer rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                  formData.templateTheme === "modern"
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Visual Preview Header */}
                  <div className="p-4 bg-muted/40 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={formData.templateTheme === "modern" ? "default" : "secondary"} className="text-[10px]">
                        Recommended
                      </Badge>
                      {formData.templateTheme === "modern" && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>

                    {/* Mockup Preview Graphic */}
                    <div className="w-full h-36 bg-background rounded-xl border border-border p-3 space-y-2 shadow-inner overflow-hidden font-sans">
                      <div className="h-4 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent rounded flex items-center justify-between px-2">
                        <div className="w-12 h-1.5 bg-primary/60 rounded" />
                        <div className="w-8 h-1.5 bg-primary/40 rounded" />
                      </div>
                      <div className="flex justify-between items-center pt-1 text-[9px] text-muted-foreground">
                        <span>INVOICE #SLN-1001</span>
                        <span>04 Sep 2026</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="h-2 bg-muted rounded w-full flex justify-between px-1 items-center">
                          <span className="text-[8px] font-bold text-foreground">Ayurvedic Syrup x2</span>
                          <span className="text-[8px] font-semibold text-foreground">₹240.00</span>
                        </div>
                        <div className="h-2 bg-muted/60 rounded w-full flex justify-between px-1 items-center">
                          <span className="text-[8px] text-muted-foreground">Herbal Tablets x1</span>
                          <span className="text-[8px] text-muted-foreground">₹150.00</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-1 border-t border-dashed border-border flex justify-between items-center bg-primary/10 p-1.5 rounded text-[9px]">
                        <span className="font-bold text-primary">Total Payable</span>
                        <span className="font-bold text-primary">₹390.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        Modern Template
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Clean contemporary design with vibrant header accents and rounded badges.
                      </p>
                    </div>

                    <ul className="text-xs space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Vibrant gradient headers & logo positioning
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Pill badges for payment modes & GST
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Rounded subtotal summary box
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    type="button"
                    variant={formData.templateTheme === "modern" ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChange("templateTheme", "modern");
                    }}
                  >
                    {formData.templateTheme === "modern" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Active Default
                      </>
                    ) : (
                      "Select Modern Template"
                    )}
                  </Button>
                </div>
              </div>

              {/* CARD 2: PROFESSIONAL TEMPLATE */}
              <div
                onClick={() => handleSelectChange("templateTheme", "professional")}
                className={`group cursor-pointer rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                  formData.templateTheme === "professional" || formData.templateTheme === "standard"
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Visual Preview Header */}
                  <div className="p-4 bg-muted/40 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={formData.templateTheme === "professional" || formData.templateTheme === "standard" ? "default" : "secondary"} className="text-[10px]">
                        Corporate
                      </Badge>
                      {(formData.templateTheme === "professional" || formData.templateTheme === "standard") && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>

                    {/* Mockup Preview Graphic */}
                    <div className="w-full h-36 bg-background rounded-xl border border-border p-3 space-y-2 shadow-inner overflow-hidden font-serif">
                      <div className="border-b-2 border-foreground/80 pb-1 flex justify-between items-center">
                        <div className="text-[10px] font-bold tracking-wide uppercase text-foreground">LAKSHMI AYURVEDA</div>
                        <div className="text-[8px] text-muted-foreground font-sans">ORIGINAL TAX INVOICE</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8px] text-muted-foreground font-sans">
                        <div>GSTIN: 29AABCU9603R1ZM</div>
                        <div className="text-right">INV #: SLN-1001</div>
                      </div>
                      <div className="border border-border rounded-none text-[8px] font-sans">
                        <div className="bg-muted px-1 py-0.5 border-b border-border flex justify-between font-bold">
                          <span>ITEM DESCRIPTION</span>
                          <span>QTY</span>
                          <span>AMOUNT</span>
                        </div>
                        <div className="px-1 py-0.5 border-b border-border flex justify-between">
                          <span>Ayurvedic Syrup</span>
                          <span>2</span>
                          <span>₹240.00</span>
                        </div>
                        <div className="px-1 py-0.5 flex justify-between">
                          <span>Herbal Tablets</span>
                          <span>1</span>
                          <span>₹150.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-sans font-bold pt-0.5">
                        <span>TOTAL TAXABLE: ₹348.21</span>
                        <span className="text-foreground">NET: ₹390.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        Professional Template
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Structured enterprise layout with formal grid lines and tax breakdowns.
                      </p>
                    </div>

                    <ul className="text-xs space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Formal grid column structure
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Detailed GST & HSN code matrix
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Bank account & signature block
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    type="button"
                    variant={formData.templateTheme === "professional" || formData.templateTheme === "standard" ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChange("templateTheme", "professional");
                    }}
                  >
                    {formData.templateTheme === "professional" || formData.templateTheme === "standard" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Active Default
                      </>
                    ) : (
                      "Select Professional Template"
                    )}
                  </Button>
                </div>
              </div>

              {/* CARD 3: MINIMAL TEMPLATE */}
              <div
                onClick={() => handleSelectChange("templateTheme", "minimal")}
                className={`group cursor-pointer rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                  formData.templateTheme === "minimal" || formData.templateTheme === "compact"
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Visual Preview Header */}
                  <div className="p-4 bg-muted/40 border-b border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={formData.templateTheme === "minimal" || formData.templateTheme === "compact" ? "default" : "secondary"} className="text-[10px]">
                        Minimalist
                      </Badge>
                      {(formData.templateTheme === "minimal" || formData.templateTheme === "compact") && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>

                    {/* Mockup Preview Graphic */}
                    <div className="w-full h-36 bg-background rounded-xl border border-border p-3 space-y-2 shadow-inner overflow-hidden font-mono text-[8px]">
                      <div className="flex justify-between items-start border-b border-border pb-1">
                        <div>
                          <div className="font-bold text-[9px] text-foreground">LAKSHMI AYURVEDA</div>
                          <div className="text-muted-foreground text-[7px]">SLN-1001 • 04/09/26</div>
                        </div>
                        <div className="text-right text-[9px] font-bold text-foreground">₹390.00</div>
                      </div>
                      <div className="space-y-0.5 pt-1">
                        <div className="flex justify-between text-[8px]">
                          <span>2x Ayurvedic Syrup</span>
                          <span>240.00</span>
                        </div>
                        <div className="flex justify-between text-[8px]">
                          <span>1x Herbal Tablets</span>
                          <span>150.00</span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-1 flex justify-between text-[8px] font-bold">
                        <span>TAX (12%): 41.78</span>
                        <span>TOTAL: 390.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        Minimal Template
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ultra-sleek monochrome design optimized for high efficiency.
                      </p>
                    </div>

                    <ul className="text-xs space-y-1.5 text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Space-saving compact line height
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        High-contrast monochrome typography
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Subtle divider lines & clean totals
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    type="button"
                    variant={formData.templateTheme === "minimal" || formData.templateTheme === "compact" ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChange("templateTheme", "minimal");
                    }}
                  >
                    {formData.templateTheme === "minimal" || formData.templateTheme === "compact" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Active Default
                      </>
                    ) : (
                      "Select Minimal Template"
                    )}
                  </Button>
                </div>
              </div>

            </div>

            {/* Template Branding Customization Controls Card */}
            <Card className="border-border shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5 text-primary" />
                  Template Branding & Header Controls
                </CardTitle>
                <CardDescription>
                  Customize brand theme color, logo alignment, and company header display toggles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Primary Color Picker & Swatches */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" /> Primary Theme Accent Color
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      { name: "Royal Indigo", hex: "#4f46e5" },
                      { name: "Emerald Green", hex: "#059669" },
                      { name: "Ocean Blue", hex: "#0284c7" },
                      { name: "Rose Crimson", hex: "#e11d48" },
                      { name: "Amber Gold", hex: "#d97706" },
                      { name: "Midnight Slate", hex: "#334155" },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => handleSelectChange("primaryColor", color.hex)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                          formData.primaryColor === color.hex
                            ? "ring-2 ring-offset-2 ring-primary scale-110 border-white shadow-md"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {formData.primaryColor === color.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}

                    {/* Custom Hex Color Picker */}
                    <div className="flex items-center gap-2 border border-input px-3 py-1.5 rounded-lg bg-background">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleSelectChange("primaryColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        id="custom-color-picker"
                      />
                      <Label htmlFor="custom-color-picker" className="text-xs font-mono uppercase cursor-pointer">
                        {formData.primaryColor}
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 2. Logo Alignment Controls */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" /> Header Logo Alignment
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={formData.logoPosition === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectChange("logoPosition", "left")}
                      className="gap-2"
                    >
                      <AlignLeft className="w-4 h-4" /> Left Aligned
                    </Button>
                    <Button
                      type="button"
                      variant={formData.logoPosition === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectChange("logoPosition", "center")}
                      className="gap-2"
                    >
                      <AlignCenter className="w-4 h-4" /> Centered
                    </Button>
                    <Button
                      type="button"
                      variant={formData.logoPosition === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectChange("logoPosition", "right")}
                      className="gap-2"
                    >
                      <AlignRight className="w-4 h-4" /> Right Aligned
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 3. Company Display Options Toggles */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Header Company Display Options
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="showTagline" className="text-xs font-medium">Show Tagline / Slogan</Label>
                        <p className="text-[11px] text-muted-foreground">Display store tagline under title</p>
                      </div>
                      <Switch
                        id="showTagline"
                        checked={formData.showTagline}
                        onCheckedChange={(chk) => handleSwitchChange("showTagline", chk)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="showGstinInHeader" className="text-xs font-medium">Show GSTIN & PAN in Header</Label>
                        <p className="text-[11px] text-muted-foreground">Display tax IDs in store header block</p>
                      </div>
                      <Switch
                        id="showGstinInHeader"
                        checked={formData.showGstinInHeader}
                        onCheckedChange={(chk) => handleSwitchChange("showGstinInHeader", chk)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="showCompanyAddress" className="text-xs font-medium">Show Physical Street Address</Label>
                        <p className="text-[11px] text-muted-foreground">Display address line under header</p>
                      </div>
                      <Switch
                        id="showCompanyAddress"
                        checked={formData.showCompanyAddress}
                        onCheckedChange={(chk) => handleSwitchChange("showCompanyAddress", chk)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="space-y-0.5">
                        <Label htmlFor="showContactDetails" className="text-xs font-medium">Show Phone & Email Contact</Label>
                        <p className="text-[11px] text-muted-foreground">Display contact info in header</p>
                      </div>
                      <Switch
                        id="showContactDetails"
                        checked={formData.showContactDetails}
                        onCheckedChange={(chk) => handleSwitchChange("showContactDetails", chk)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Invoice Preview Panel */}
            <Card className="border-primary/20 bg-muted/10 shadow-sm mt-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Eye className="w-5 h-5 text-primary" />
                    Live Printable Invoice Preview
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Real-time invoice rendering with sample data. Updates instantly when template, branding, or terms change.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs font-mono px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
                    {formData.paperSize} Size • {formData.templateTheme?.toUpperCase()}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="gap-2 text-xs"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-primary" /> Fullscreen View
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <LiveInvoicePreview settingsData={formData} />
              </CardContent>
            </Card>

            {/* Additional Layout & Print Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      Invoice Prefix & Numbering Sequence
                    </CardTitle>
                    <CardDescription>
                      Configure prefix tags and invoice sequence defaults.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoicePrefix">Invoice Prefix *</Label>
                        <Input
                          id="invoicePrefix"
                          name="invoicePrefix"
                          value={formData.invoicePrefix}
                          onChange={handleChange}
                          placeholder="e.g. SLN"
                          className="font-mono"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Sample sequence: <span className="font-mono font-semibold text-foreground">{formData.invoicePrefix || "INV"}-001001</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startingInvoiceNumber">Starting Serial Number</Label>
                        <Input
                          id="startingInvoiceNumber"
                          name="startingInvoiceNumber"
                          type="number"
                          value={formData.startingInvoiceNumber}
                          onChange={handleChange}
                          placeholder="1001"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Printer className="w-5 h-5 text-primary" />
                      Page Size & Branding Options
                    </CardTitle>
                    <CardDescription>Configure physical paper output format.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Paper Size Format</Label>
                        <Select
                          value={formData.paperSize}
                          onValueChange={(val) => handleSelectChange("paperSize", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select paper size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">Standard A4 Sheet</SelectItem>
                            <SelectItem value="Thermal">3-Inch Thermal Receipt (POS)</SelectItem>
                            <SelectItem value="A5">Compact A5 Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="showLogo">Display Logo Header</Label>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">Include store brand emblem</span>
                          <Switch
                            id="showLogo"
                            checked={formData.showLogo}
                            onCheckedChange={(chk) => handleSwitchChange("showLogo", chk)}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-2">
                      <Label htmlFor="customTerms">Invoice Footer Terms & Conditions</Label>
                      <Textarea
                        id="customTerms"
                        name="customTerms"
                        value={formData.customTerms}
                        onChange={handleChange}
                        placeholder="Enter terms, return policy, jurisdiction notes..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Print Summary Sidebar */}
              <div className="space-y-6">
                <Card className="bg-muted/40 border-muted">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Printer className="w-4 h-4 text-primary" /> Default Invoice Config
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Active Template:</span>
                      <Badge variant="default" className="capitalize">
                        {formData.templateTheme}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Paper Size:</span>
                      <span className="font-semibold">{formData.paperSize}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Invoice Prefix:</span>
                      <span className="font-mono font-semibold">{formData.invoicePrefix}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Brand Logo:</span>
                      <span>{formData.showLogo ? "Visible" : "Hidden"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSaving ? "Saving Default..." : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Selected Default
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SECTION 3: PAYMENT DETAILS */}
          <TabsContent value="payment-details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Card 1: Direct Bank Transfer Account */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Landmark className="w-5 h-5 text-primary" />
                      Direct Bank Transfer Account
                    </CardTitle>
                    <CardDescription>
                      Bank account credentials printed on invoices for NEFT / RTGS / IMPS payments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                          placeholder="e.g. State Bank of India"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name *</Label>
                        <Input
                          id="accountHolder"
                          name="accountHolder"
                          value={formData.accountHolder}
                          onChange={handleChange}
                          placeholder="e.g. Lakshmi Ayurveda Distributors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          placeholder="389201002938"
                          className="font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                        <Input
                          id="ifscCode"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                          placeholder="SBIN0001234"
                          className="font-mono uppercase"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branchName">Branch Location</Label>
                        <Input
                          id="branchName"
                          name="branchName"
                          value={formData.branchName}
                          onChange={handleChange}
                          placeholder="e.g. Indiranagar Branch"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: UPI & Digital Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <QrCode className="w-5 h-5 text-primary" />
                      UPI & Digital Payments
                    </CardTitle>
                    <CardDescription>Configure instant UPI payment VPA address and scan-to-pay QR code.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">Virtual Payment Address (UPI ID) *</Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                        className="font-mono"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-border/60">
                      <div className="space-y-0.5">
                        <Label htmlFor="showQrCode">Embed Dynamic UPI QR Code</Label>
                        <p className="text-xs text-muted-foreground">
                          Print scan-to-pay QR code directly on customer receipts
                        </p>
                      </div>
                      <Switch
                        id="showQrCode"
                        checked={formData.showQrCode}
                        onCheckedChange={(chk) => handleSwitchChange("showQrCode", chk)}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <Label>Accepted Payment Methods</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {["Cash", "UPI", "Card", "Net Banking", "Cheque"].map((method) => {
                          const isSelected = formData.acceptedPaymentMethods.includes(method);
                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() => handlePaymentMethodToggle(method)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <span>{method}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Payment Instructions & Default Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      Payment Instructions & Default Terms
                    </CardTitle>
                    <CardDescription>
                      Configure settlement instructions and invoice payment due timelines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultPaymentTerms">Default Payment Due Timeline</Label>
                      <Select
                        value={formData.defaultPaymentTerms}
                        onValueChange={(val) => handleSelectChange("defaultPaymentTerms", val)}
                      >
                        <SelectTrigger id="defaultPaymentTerms">
                          <SelectValue placeholder="Select Payment Terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Due on Receipt">Due on Receipt (Immediate)</SelectItem>
                          <SelectItem value="Net 7 Days">Net 7 Days</SelectItem>
                          <SelectItem value="Net 15 Days">Net 15 Days</SelectItem>
                          <SelectItem value="Net 30 Days">Net 30 Days</SelectItem>
                          <SelectItem value="50% Advance & 50% on Delivery">50% Advance & 50% on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentInstructions">Payment Instructions & Notes</Label>
                      <Textarea
                        id="paymentInstructions"
                        name="paymentInstructions"
                        value={formData.paymentInstructions}
                        onChange={handleChange}
                        placeholder="e.g. Please share payment reference ID / UTR number via WhatsApp +91 9876543210 for instant dispatch..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Instructions will automatically print in the payment footer section of invoices.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Summary & Save Sidebar */}
              <div className="space-y-6">
                <Card className="bg-muted/40 border-muted">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" /> Bank & Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 bg-background rounded-lg border border-border space-y-1 font-mono">
                      <p className="font-bold text-foreground truncate">{formData.bankName || "Bank Name"}</p>
                      <p className="text-muted-foreground text-[11px]">Holder: <span className="font-semibold text-foreground">{formData.accountHolder || "..."}</span></p>
                      <p className="text-muted-foreground text-[11px]">A/C: <span className="font-semibold text-foreground">{formData.accountNumber || "..."}</span></p>
                      <p className="text-muted-foreground text-[11px]">IFSC: <span className="font-semibold text-foreground">{formData.ifscCode || "..."}</span></p>
                      {formData.branchName && <p className="text-muted-foreground text-[10px]">Branch: {formData.branchName}</p>}
                    </div>

                    <div className="p-3 bg-background rounded-lg border border-border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">UPI ID</p>
                        <p className="font-mono font-semibold text-xs text-foreground">{formData.upiId || "..."}</p>
                      </div>
                      <Badge variant={formData.showQrCode ? "default" : "outline"} className="text-[10px]">
                        {formData.showQrCode ? "QR Active" : "QR Off"}
                      </Badge>
                    </div>

                    <div className="p-3 bg-background rounded-lg border border-border space-y-1 text-[11px]">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Default Payment Due</p>
                      <p className="font-bold text-primary">{formData.defaultPaymentTerms}</p>
                    </div>

                    {formData.paymentInstructions && (
                      <div className="p-3 bg-background rounded-lg border border-border space-y-1 text-[11px]">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Instructions Note</p>
                        <p className="text-muted-foreground italic line-clamp-2">{formData.paymentInstructions}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSaving ? "Saving Payment Details..." : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Payment Details
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SECTION 4: TAX & GST */}
          <TabsContent value="tax-gst" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Percent className="w-5 h-5 text-primary" />
                      GST Registration & Tax Setup
                    </CardTitle>
                    <CardDescription>
                      Configure Goods and Services Tax credentials for tax compliance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN Identification Number</Label>
                      <Input
                        id="gstin"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        placeholder="e.g. 29AABCU9603R1ZM"
                        className="font-mono uppercase tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stateCode">State Code (2-Digit GST Code)</Label>
                        <Input
                          id="stateCode"
                          name="stateCode"
                          value={formData.stateCode}
                          onChange={handleChange}
                          placeholder="e.g. 29"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultHsn">Default HSN Code</Label>
                        <Input
                          id="defaultHsn"
                          name="defaultHsn"
                          value={formData.defaultHsn}
                          onChange={handleChange}
                          placeholder="e.g. 30049011"
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default GST Rate (%)</Label>
                        <Select
                          value={String(formData.defaultGstRate)}
                          onValueChange={(val) => handleSelectChange("defaultGstRate", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select GST Rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% (Exempt)</SelectItem>
                            <SelectItem value="5">5% GST Rate</SelectItem>
                            <SelectItem value="12">12% GST Rate (Standard)</SelectItem>
                            <SelectItem value="18">18% GST Rate</SelectItem>
                            <SelectItem value="28">28% GST Rate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tax Calculation Type</Label>
                        <Select
                          value={formData.taxType}
                          onValueChange={(val) => handleSelectChange("taxType", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Tax Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exclusive">Exclusive (Added to Subtotal)</SelectItem>
                            <SelectItem value="inclusive">Inclusive (Included in Price)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-border">
                      <div className="space-y-0.5">
                        <Label htmlFor="isComposition">Composition Scheme Dealer</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable if registered under GST composition scheme
                        </p>
                      </div>
                      <Switch
                        id="isComposition"
                        checked={formData.isComposition}
                        onCheckedChange={(chk) => handleSwitchChange("isComposition", chk)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tax Summary Preview */}
              <div className="space-y-6">
                <Card className="bg-muted/40 border-muted">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary" /> Tax Config Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">GSTIN:</span>
                      <span className="font-mono font-semibold">{formData.gstin || "Not Set"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">State Code:</span>
                      <span className="font-mono font-semibold">{formData.stateCode || "--"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Default Rate:</span>
                      <Badge variant="outline">{formData.defaultGstRate}%</Badge>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Tax Mode:</span>
                      <span className="capitalize font-semibold">{formData.taxType}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {/* Fullscreen Live Invoice Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-primary" /> Live Printable Invoice Preview ({formData.templateTheme?.toUpperCase()})
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <LiveInvoicePreview settingsData={formData} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
