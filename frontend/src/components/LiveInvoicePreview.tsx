import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, MapPin, Phone, Mail, Globe, QrCode, CheckCircle2, FileText, Landmark } from "lucide-react";

export interface LiveInvoicePreviewProps {
  settingsData: {
    shopName?: string;
    companyName?: string;
    tagline?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    website?: string;
    logoUrl?: string;
    gstin?: string;
    pan?: string;
    defaultCurrency?: string;

    invoicePrefix?: string;
    startingInvoiceNumber?: number;
    paperSize?: string;
    templateTheme?: string;
    showLogo?: boolean;
    customTerms?: string;

    primaryColor?: string;
    logoPosition?: 'left' | 'center' | 'right';
    showTagline?: boolean;
    showGstinInHeader?: boolean;
    showCompanyAddress?: boolean;
    showContactDetails?: boolean;

    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
    showQrCode?: boolean;
    paymentInstructions?: string;
    defaultPaymentTerms?: string;
  };
}

export const LiveInvoicePreview: React.FC<LiveInvoicePreviewProps> = ({ settingsData }) => {
  const companyName = settingsData.companyName || settingsData.shopName || "LAKSHMI AYURVEDA Distributors Pvt Ltd";
  const tagline = settingsData.tagline || "Quality Ayurvedic Products & Wellness";
  const phone = settingsData.phone || "+91 98765 43210";
  const email = settingsData.email || "contact@lakshmiayurveda.com";
  const address = settingsData.address || "123, Main Road, Near Bus Stand";
  const city = settingsData.city || "Bengaluru";
  const state = settingsData.state || "Karnataka";
  const country = settingsData.country || "India";
  const pincode = settingsData.pincode || "560001";
  const website = settingsData.website || "https://lakshmiayurveda.com";
  const gstin = settingsData.gstin || "29AABCU9603R1ZM";
  const pan = settingsData.pan || "AABCU9603R";
  const currencySymbol = settingsData.defaultCurrency === "USD" ? "$" : settingsData.defaultCurrency === "EUR" ? "€" : settingsData.defaultCurrency === "GBP" ? "£" : settingsData.defaultCurrency === "AED" ? "AED " : "₹";

  const prefix = settingsData.invoicePrefix || "SLN";
  const invNo = `${prefix}-${settingsData.startingInvoiceNumber || 1001}`;
  const theme = settingsData.templateTheme || "modern";
  const showLogo = settingsData.showLogo !== false;
  const logoUrl = settingsData.logoUrl;
  const paperSize = settingsData.paperSize || "A4";

  // Branding Customization Properties
  const primaryColor = settingsData.primaryColor || "#4f46e5";
  const logoPosition = settingsData.logoPosition || "left";
  const showTagline = settingsData.showTagline !== false;
  const showGstinInHeader = settingsData.showGstinInHeader !== false;
  const showCompanyAddress = settingsData.showCompanyAddress !== false;
  const showContactDetails = settingsData.showContactDetails !== false;

  const sampleItems = [
    { id: 1, name: "Ashwagandha Churna (250g)", hsn: "30049011", qty: 2, price: 240.0, gst: 12, total: 480.0 },
    { id: 2, name: "Triphala Tablets (60 Caps)", hsn: "30049011", qty: 3, price: 150.0, gst: 12, total: 450.0 },
    { id: 3, name: "Mahanarayan Oil (100ml)", hsn: "30049011", qty: 1, price: 320.0, gst: 12, total: 320.0 },
  ];

  const subtotal = 1250.0;
  const discount = 62.5; // 5%
  const taxable = 1187.5;
  const cgst = 71.25;
  const sgst = 71.25;
  const totalTax = 142.5;
  const grandTotal = 1330.0;

  // Header Flex Alignment Class based on Logo Position
  const getHeaderLayoutClasses = () => {
    if (logoPosition === "center") {
      return "flex-col items-center text-center";
    }
    if (logoPosition === "right") {
      return "flex-row-reverse justify-between items-center text-right";
    }
    return "flex-row justify-start items-center text-left";
  };

  // Render Theme 1: MODERN TEMPLATE
  if (theme === "modern") {
    return (
      <div className={`w-full bg-background text-foreground rounded-xl border border-border shadow-md overflow-hidden ${paperSize === "Thermal" ? "max-w-xs mx-auto p-4 text-xs" : "p-6"}`}>
        {/* Top Header Banner with Dynamic Accent Color & Logo Position */}
        <div
          className="-mx-6 -mt-6 p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}08 100%)`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className={`flex gap-3 w-full sm:w-auto ${getHeaderLayoutClasses()}`}>
            {showLogo && (
              <div
                className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
                style={{ borderColor: `${primaryColor}40` }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Store className="w-6 h-6" style={{ color: primaryColor }} />
                )}
              </div>
            )}
            <div className={logoPosition === "center" ? "text-center" : logoPosition === "right" ? "text-right" : "text-left"}>
              <h2 className="text-lg font-bold tracking-tight text-foreground">{companyName}</h2>
              {showTagline && <p className="text-xs text-muted-foreground">{tagline}</p>}
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            <Badge
              className="text-xs px-2.5 py-0.5 font-bold mb-1 border"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
                borderColor: `${primaryColor}40`,
              }}
            >
              TAX INVOICE
            </Badge>
            <p className="text-sm font-mono font-bold">{invNo}</p>
            <p className="text-xs text-muted-foreground">Date: 04 Sep 2026</p>
          </div>
        </div>

        {/* Store & Customer Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
          <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="font-semibold uppercase text-[10px] tracking-wider" style={{ color: primaryColor }}>
              Billed From
            </span>
            <p className="font-bold text-foreground text-sm">{companyName}</p>
            {showCompanyAddress && (
              <p className="text-muted-foreground">{address}, {city}, {state} - {pincode}</p>
            )}
            {showContactDetails && (
              <p className="text-muted-foreground">Phone: {phone} | Email: {email}</p>
            )}
            {showGstinInHeader && (
              <p className="font-mono text-[11px] pt-1">
                GSTIN: <span className="font-semibold text-foreground">{gstin}</span> | PAN: <span className="font-semibold text-foreground">{pan}</span>
              </p>
            )}
          </div>

          <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="font-semibold uppercase text-[10px] tracking-wider" style={{ color: primaryColor }}>
              Billed To
            </span>
            <p className="font-bold text-foreground text-sm">Aarav Sharma</p>
            <p className="text-muted-foreground">Apollo Wellness Clinic, 45 Lotus Enclave</p>
            <p className="text-muted-foreground">Indiranagar, Bengaluru - 560038</p>
            <p className="font-mono text-[11px] pt-1">GSTIN: <span className="font-semibold text-foreground">29AAAPA1234F1Z5</span></p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-lg border border-border overflow-hidden my-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 text-center">HSN</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Price</th>
                <th className="p-2.5 text-right">GST</th>
                <th className="p-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="p-2.5 font-medium">{item.name}</td>
                  <td className="p-2.5 text-center font-mono text-muted-foreground">{item.hsn}</td>
                  <td className="p-2.5 text-center font-bold">{item.qty}</td>
                  <td className="p-2.5 text-right">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="p-2.5 text-right text-muted-foreground">{item.gst}%</td>
                  <td className="p-2.5 text-right font-semibold">{currencySymbol}{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Payment & Bank Details */}
          <div className="space-y-2 text-xs bg-muted/20 p-3 rounded-lg border border-border/60">
            <p className="font-bold flex items-center justify-between text-foreground">
              <span className="flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5" style={{ color: primaryColor }} /> Bank & Payment Details
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                Terms: {settingsData.defaultPaymentTerms || "Due on Receipt"}
              </Badge>
            </p>
            <div className="space-y-0.5 text-muted-foreground font-mono text-[11px]">
              <p>Holder: <span className="text-foreground font-semibold">{settingsData.accountHolder || "Lakshmi Ayurveda Distributors"}</span></p>
              <p>Bank: <span className="text-foreground font-semibold">{settingsData.bankName || "State Bank of India"}</span></p>
              <p>A/C: <span className="text-foreground font-semibold">{settingsData.accountNumber || "389201002938"}</span></p>
              <p>IFSC: <span className="text-foreground font-semibold">{settingsData.ifscCode || "SBIN0001234"}</span></p>
              {settingsData.branchName && <p>Branch: <span className="text-foreground font-semibold">{settingsData.branchName}</span></p>}
              <p>UPI ID: <span className="text-foreground font-semibold">{settingsData.upiId || "lakshmiayurveda@upi"}</span></p>
            </div>
            {settingsData.paymentInstructions && (
              <div className="pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground italic">
                <span className="font-semibold text-foreground not-italic">Instructions: </span>
                {settingsData.paymentInstructions}
              </div>
            )}
            {settingsData.showQrCode !== false && (
              <div className="pt-2 flex items-center gap-2">
                <div className="w-12 h-12 bg-white border border-border rounded flex items-center justify-center p-1 shrink-0">
                  <QrCode className="w-full h-full text-slate-800" />
                </div>
                <span className="text-[10px] text-muted-foreground">Scan with any UPI app (GPay / PhonePe / Paytm) to pay directly</span>
              </div>
            )}
          </div>

          {/* Subtotal & Tax Breakdown */}
          <div
            className="space-y-1.5 text-xs p-4 rounded-xl border"
            style={{
              backgroundColor: `${primaryColor}08`,
              borderColor: `${primaryColor}30`,
            }}
          >
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Discount (5%)</span>
              <span>-{currencySymbol}{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxable Value</span>
              <span>{currencySymbol}{taxable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>CGST (6%) + SGST (6%)</span>
              <span>{currencySymbol}{totalTax.toFixed(2)}</span>
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between text-base font-bold" style={{ color: primaryColor }}>
              <span>Grand Total</span>
              <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-right italic pt-1">
              Amount in words: INR One Thousand Three Hundred Thirty Only
            </p>
          </div>
        </div>

        {/* Custom Terms & Footer */}
        {settingsData.customTerms && (
          <div className="border-t border-border pt-3 mt-4 text-[10px] text-muted-foreground space-y-1">
            <span className="font-semibold uppercase text-foreground">Terms & Conditions:</span>
            <p className="whitespace-pre-line">{settingsData.customTerms}</p>
          </div>
        )}
      </div>
    );
  }

  // Render Theme 2: PROFESSIONAL TEMPLATE
  if (theme === "professional" || theme === "standard") {
    return (
      <div className={`w-full bg-background text-foreground rounded-xl border-2 shadow-md p-6 font-serif ${paperSize === "Thermal" ? "max-w-xs mx-auto p-4 text-xs" : ""}`} style={{ borderColor: primaryColor }}>
        {/* Corporate Double Line Header */}
        <div className="border-b-4 border-double pb-4 mb-4 flex justify-between items-start" style={{ borderColor: primaryColor }}>
          <div className={`flex gap-3 w-full ${getHeaderLayoutClasses()}`}>
            {showLogo && logoUrl && (
              <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
            )}
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide" style={{ color: primaryColor }}>{companyName}</h1>
              {showTagline && <p className="text-xs italic text-muted-foreground font-sans">{tagline}</p>}
              {showCompanyAddress && <p className="text-xs font-sans text-muted-foreground">{address}, {city}, {state} - {pincode}</p>}
              {showContactDetails && <p className="text-xs font-sans text-muted-foreground">Ph: {phone} | Email: {email}</p>}
              {showGstinInHeader && <p className="text-xs font-sans text-muted-foreground">GSTIN: <span className="font-mono font-semibold text-foreground">{gstin}</span></p>}
            </div>
          </div>

          <div className="text-right font-sans shrink-0">
            <div className="text-xs font-bold uppercase tracking-widest border px-2 py-1 mb-1 inline-block" style={{ color: primaryColor, borderColor: primaryColor }}>
              OFFICIAL TAX INVOICE
            </div>
            <p className="text-sm font-mono font-bold text-foreground">{invNo}</p>
            <p className="text-xs text-muted-foreground">Date: 04-09-2026</p>
          </div>
        </div>

        {/* Corporate Billing Matrix */}
        <div className="grid grid-cols-2 gap-4 border p-3 mb-4 text-xs font-sans" style={{ borderColor: `${primaryColor}40` }}>
          <div>
            <span className="font-bold uppercase text-[10px]" style={{ color: primaryColor }}>BUYER (BILLED TO):</span>
            <p className="font-bold text-sm">Aarav Sharma</p>
            <p>Apollo Wellness Clinic, Indiranagar, Bengaluru</p>
            <p>GSTIN: <span className="font-mono font-semibold">29AAAPA1234F1Z5</span></p>
          </div>
          <div className="text-right border-l pl-3" style={{ borderColor: `${primaryColor}40` }}>
            <p><span className="font-bold">Place of Supply:</span> Karnataka (29)</p>
            <p><span className="font-bold">Reverse Charge:</span> NO</p>
            <p><span className="font-bold">Payment Status:</span> PAID (UPI)</p>
          </div>
        </div>

        {/* Formal Grid Table */}
        <div className="border mb-4 font-sans text-xs" style={{ borderColor: primaryColor }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white text-[11px] font-bold" style={{ backgroundColor: primaryColor }}>
                <th className="p-2 border-r border-white/20">Sl</th>
                <th className="p-2 border-r border-white/20">Description of Goods</th>
                <th className="p-2 border-r border-white/20 text-center">HSN/SAC</th>
                <th className="p-2 border-r border-white/20 text-center">Qty</th>
                <th className="p-2 border-r border-white/20 text-right">Rate</th>
                <th className="p-2 text-right">Amount ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-border text-[11px]">
                  <td className="p-2 border-r border-border text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-border font-semibold">{item.name}</td>
                  <td className="p-2 border-r border-border text-center font-mono">{item.hsn}</td>
                  <td className="p-2 border-r border-border text-center font-bold">{item.qty}</td>
                  <td className="p-2 border-r border-border text-right">{item.price.toFixed(2)}</td>
                  <td className="p-2 text-right font-bold">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Breakdown Table & Total */}
        <div className="grid grid-cols-2 gap-4 font-sans text-xs mb-4">
          <div className="border border-border p-2 space-y-1">
            <span className="font-bold uppercase text-[10px]" style={{ color: primaryColor }}>BANK REMITTANCE ACCOUNT:</span>
            <p className="font-mono">Bank: {settingsData.bankName || "State Bank of India"}</p>
            <p className="font-mono">A/C No: {settingsData.accountNumber || "389201002938"}</p>
            <p className="font-mono">IFSC: {settingsData.ifscCode || "SBIN0001234"}</p>
          </div>

          <div className="space-y-1 text-right">
            <div className="flex justify-between border-b border-border py-0.5">
              <span>Sub Total:</span>
              <span className="font-bold">{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-border py-0.5">
              <span>CGST (6%) + SGST (6%):</span>
              <span>{currencySymbol}{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 pt-1" style={{ color: primaryColor, borderColor: primaryColor }}>
              <span>TOTAL INVOICE VALUE:</span>
              <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature & Terms */}
        <div className="border-t border-border pt-3 mt-4 flex justify-between items-end font-sans text-[10px] text-muted-foreground">
          <div className="space-y-1 max-w-xs">
            <span className="font-bold uppercase text-foreground">Terms:</span>
            <p className="whitespace-pre-line">{settingsData.customTerms || "1. Goods once sold will not be taken back."}</p>
          </div>
          <div className="text-center space-y-8">
            <p className="font-bold text-foreground">For {companyName}</p>
            <p className="border-t border-foreground pt-1 font-semibold text-foreground">Authorized Signatory</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Theme 3: MINIMAL TEMPLATE
  return (
    <div className={`w-full bg-background text-foreground rounded-xl border border-border shadow-sm p-6 font-mono text-xs ${paperSize === "Thermal" ? "max-w-xs mx-auto p-3 text-[10px]" : ""}`}>
      {/* High Contrast Header */}
      <div className="border-b pb-3 mb-4 flex justify-between items-start" style={{ borderColor: primaryColor }}>
        <div className={`flex gap-2 w-full ${getHeaderLayoutClasses()}`}>
          {showLogo && logoUrl && (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain shrink-0" />
          )}
          <div>
            <h2 className="text-base font-bold tracking-tight" style={{ color: primaryColor }}>{companyName}</h2>
            {showTagline && <p className="text-[10px] text-muted-foreground font-sans">{tagline}</p>}
            {showCompanyAddress && <p className="text-[10px] text-muted-foreground font-sans">{address}, {city}</p>}
            {showGstinInHeader && <p className="text-[10px] text-muted-foreground font-sans">GSTIN: {gstin}</p>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold border-b pb-0.5" style={{ borderColor: primaryColor }}>{invNo}</span>
          <p className="text-[10px] text-muted-foreground pt-1">04/09/2026</p>
        </div>
      </div>

      {/* Minimal Customer Details */}
      <div className="flex justify-between border-b border-muted pb-2 mb-3 text-[11px] font-sans">
        <div>
          <span className="text-muted-foreground">CUSTOMER:</span> <span className="font-bold text-foreground">Aarav Sharma</span>
        </div>
        <div>
          <span className="text-muted-foreground">PAYMENT:</span> <span className="font-bold text-emerald-600">PAID</span>
        </div>
      </div>

      {/* Slim Borderless Items List */}
      <div className="space-y-2 mb-4 font-sans">
        <div className="flex justify-between font-bold text-[10px] border-b border-border pb-1 text-muted-foreground">
          <span>ITEM</span>
          <span className="w-12 text-center">QTY</span>
          <span className="w-16 text-right">TOTAL</span>
        </div>
        {sampleItems.map((item) => (
          <div key={item.id} className="flex justify-between text-xs py-0.5">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="w-12 text-center font-mono">{item.qty}</span>
            <span className="w-16 text-right font-mono font-bold">{currencySymbol}{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Minimal Total Summary */}
      <div className="border-t pt-2 space-y-1 text-right font-mono" style={{ borderColor: primaryColor }}>
        <div className="flex justify-between text-muted-foreground">
          <span>SUBTOTAL</span>
          <span>{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>TAX (12%)</span>
          <span>{currencySymbol}{totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border pt-1" style={{ color: primaryColor }}>
          <span>TOTAL</span>
          <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Terms Footer */}
      {settingsData.customTerms && (
        <div className="border-t border-border pt-2 mt-4 text-[9px] text-muted-foreground font-sans">
          <p className="whitespace-pre-line">{settingsData.customTerms}</p>
        </div>
      )}
    </div>
  );
};

export default LiveInvoicePreview;
