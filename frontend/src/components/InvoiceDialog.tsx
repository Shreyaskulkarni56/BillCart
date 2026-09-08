import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Printer, Download, Plus, Minus, Trash2, Edit2 } from "lucide-react";
import { BillItem, Customer } from "../types";
import { useApp } from "../context/AppContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface EditableItem extends BillItem {
  hsnCode: string;
  gstRate: number;
  cgstRate?: number;
  freeQty: number;
  batchNo: string;
  mrp: number;
}

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  items: BillItem[];
  onUpdateItem: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onConfirm: (customItems?: BillItem[]) => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
  isReadOnly?: boolean;
  pastInvoiceNo?: string;
  pastDate?: string;
  onUpdateDate?: (date: string) => void;
}

interface ShopInfo {
  name: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  state: string;
  stateCode: string;
}

interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  gstin?: string;
}

// Convert number to words for Indian currency
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = 'INR ' + convert(rupees);
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise';
  }
  result += ' Only';
  return result;
};

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  isOpen,
  onClose,
  customer,
  items,
  onUpdateItem,
  onRemoveItem,
  onConfirm,
  discount,
  onDiscountChange,
  isReadOnly = false,
  pastInvoiceNo,
  pastDate,
  onUpdateDate,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const { products, settings, sales } = useApp();

  const [shopInfo, setShopInfo] = useState<ShopInfo>({ 
    name: "LAKSHMI AYURVEDA Distributors",
    address: "123, Main Road, Near Bus Stand\nCity Name, District - 560001",
    gstin: "",
    phone: "+91 98765 43210",
    email: "shop@ayurveda.com",
    state: "Karnataka",
    stateCode: "29",
  }); 

  React.useEffect(() => {
    if (settings) {
      setShopInfo({
        name: settings.shopName ?? shopInfo.name,
        address: settings.address ?? shopInfo.address,
        gstin: settings.gstin ?? shopInfo.gstin,
        phone: settings.phone ?? shopInfo.phone,
        email: settings.email ?? shopInfo.email,
        state: settings.state ?? shopInfo.state,
        stateCode: settings.stateCode ?? shopInfo.stateCode,
      });
    }
  }, [settings]);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: customer?.name || "Walk-in Customer",
    address: customer?.address || "",
    phone: customer?.phone || "",
    gstin: "",
  });

  React.useEffect(() => {
    if (customer) {
      setCustomerInfo({
        name: customer.name,
        address: customer.address || "",
        phone: customer.phone,
        gstin: "",
      });
    }
  }, [customer]);

  React.useEffect(() => {
    if (isOpen) {
      const enriched = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const gstRate = item.gstRate !== undefined ? item.gstRate : (product?.gstRate || 5);
        return {
          ...item,
          hsnCode: item.hsnCode || product?.hsnCode || "3004",
          gstRate,
          cgstRate: gstRate / 2,
          freeQty: item.freeQty || 0,
          batchNo: item.batchNo || `B${Date.now().toString().slice(-6)}`,
          mrp: item.mrp !== undefined ? item.mrp : item.price,
        };
      });
      setEditableItems(enriched);
    }
  }, [isOpen, items.length]);

  // Update editable item field
  const updateItemField = (productId: string, field: keyof EditableItem, value: string | number) => {
    if (field === "quantity" && onUpdateItem) {
      onUpdateItem(productId, Math.max(1, Number(value) || 1));
    }
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const updatedItem = { ...item, [field]: value };
          if (field === "cgstRate") {
            const cgst = Math.max(0, Number(value) || 0);
            updatedItem.cgstRate = cgst;
            updatedItem.gstRate = cgst * 2;
          }
          if (field === "quantity" || field === "price") {
            const qty = Number(updatedItem.quantity) || 0;
            const prc = Number(updatedItem.price) || 0;
            updatedItem.total = qty * prc;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Calculate tax breakdown per item
  const calculateItemTax = (item: EditableItem) => {
    const taxableAmount = item.total;
    const cgstRate = item.cgstRate !== undefined ? item.cgstRate : ((item.gstRate || 5) / 2);
    const sgstRate = cgstRate;
    const cgstAmount = Math.round((taxableAmount * (cgstRate / 100)) * 100) / 100;
    const sgstAmount = cgstAmount;
    return { taxableAmount, cgstRate, sgstRate, cgstAmount, sgstAmount };
  };

  const subtotal = editableItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;

  const totalCgst = editableItems.reduce((sum, item) => {
    const discountedTotal = item.total - (item.total * discount / 100);
    const cgstRate = (item.gstRate || 5) / 2;
    const taxAmount = Math.round((discountedTotal * cgstRate / 100) * 100) / 100;
    return sum + taxAmount;
  }, 0);

  const totalSgst = totalCgst;
  const totalTax = totalCgst + totalSgst;
  const rawGrandTotal = taxableAmount + totalTax;
  const roundedNet = Math.round(rawGrandTotal);
  const roundOff = roundedNet - rawGrandTotal;
  const grandTotal = roundedNet;

  const prefix = settings?.invoicePrefix || "SLN";
  
  let nextInvoiceNumber = 1;
  if (sales && sales.length > 0) {
    const maxNum = sales.reduce((max, sale) => {
      if (sale.invoiceNo) {
        const numericPart = sale.invoiceNo.replace(/\D/g, '');
        if (numericPart) {
           return Math.max(max, parseInt(numericPart, 10));
        }
      }
      return max;
    }, 0);
    nextInvoiceNumber = maxNum > 0 ? maxNum + 1 : sales.length + 1;
  }
  
  
  const invoiceNumber = pastInvoiceNo || `${prefix}${String(nextInvoiceNumber).padStart(4, '0')}`;
  const currentDate = pastDate ? new Date(pastDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) : new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isCleanView = isReadOnly || isExporting;

  // Exact Preview-to-Print Handler: Copies exact rendered preview element DOM and document styles
  const handlePrint = async () => {
    if (!invoiceRef.current) return;

    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Collect all stylesheets from document to preserve exact Tailwind classes, colors, fonts, and borders
      const stylesHtml = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
        .map((el) => el.outerHTML)
        .join("\n");

      const elementHtml = invoiceRef.current.outerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Invoice - ${invoiceNumber}</title>
            ${stylesHtml}
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              @media print {
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background-color: #ffffff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              body {
                font-family: inherit;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .invoice-print-wrapper {
                width: 100%;
                max-width: 210mm;
                margin: 0 auto;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            <div class="invoice-print-wrapper">
              ${elementHtml}
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.focus();
                  window.print();
                  window.close();
                }, 350);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setIsExporting(false);
    }
  };

  // Exact Preview-to-PDF Handler: Captures high-DPI canvas snapshot of exact rendered preview element
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      // Ensure all images are loaded
      const images = Array.from(invoiceRef.current.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // High resolution (300 DPI)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm margin
      const printableWidth = pdfWidth - margin * 2; // 194mm

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, Math.min(imgHeight, pdfHeight - margin * 2));
      pdf.save(`Invoice_${invoiceNumber.replace(/\//g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF snapshot:", err);
    } finally {
      setIsExporting(false);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold">GST Tax Invoice</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Preview */}
        {/* Invoice Container with Dynamic Theme & Branding Settings */}
        <div
          ref={invoiceRef}
          className="bg-white border-2 rounded-none text-foreground text-sm font-serif shadow-sm overflow-hidden"
          style={{ borderColor: settings?.primaryColor || "#000000" }}
        >
          {/* Header */}
          <div
            className="p-4 border-b-2 transition-all flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{
              borderColor: settings?.primaryColor || "#000000",
              backgroundColor: settings?.primaryColor ? `${settings.primaryColor}10` : "#f8fafc",
            }}
          >
            <div
              className={`flex gap-3 items-center w-full ${
                settings?.logoPosition === "center"
                  ? "flex-col justify-center text-center"
                  : settings?.logoPosition === "right"
                  ? "flex-row-reverse justify-between text-right"
                  : "flex-row justify-start text-left"
              }`}
            >
              {settings?.showLogo !== false && (settings?.logoUrl || "/logo.png") && (
                <div className="max-h-16 max-w-[150px] overflow-hidden shrink-0">
                  <img
                    id="invoice-logo"
                    src={settings?.logoUrl || "/logo.png"}
                    alt="Logo"
                    className="max-h-16 max-w-[150px] object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
              <div className={settings?.logoPosition === "center" ? "text-center" : settings?.logoPosition === "right" ? "text-right" : "text-left"}>
                <h1 className="text-xl font-bold uppercase tracking-wide" style={{ color: settings?.primaryColor || "#000000" }}>
                  {shopInfo.name}
                </h1>
                {settings?.showTagline !== false && settings?.tagline && (
                  <p className="text-xs italic text-muted-foreground font-sans">{settings.tagline}</p>
                )}
                {settings?.showCompanyAddress !== false && (
                  <p className="text-xs mt-0.5">{shopInfo.address.replace(/\n/g, ", ")}</p>
                )}
                {settings?.showContactDetails !== false && (
                  <p className="text-xs text-muted-foreground">Phone: {shopInfo.phone} | Email: {shopInfo.email}</p>
                )}
                {settings?.showGstinInHeader !== false && shopInfo.gstin && (
                  <p className="text-xs font-bold font-mono mt-0.5">GSTIN: {shopInfo.gstin} {settings?.pan ? `| PAN: ${settings.pan}` : ""}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Invoice Title Banner */}
          <div
            className="text-center py-2 border-b font-bold text-base tracking-wider text-white"
            style={{
              backgroundColor: settings?.primaryColor || "#1e293b",
              borderColor: settings?.primaryColor || "#000000",
            }}
          >
            OFFICIAL TAX INVOICE
          </div>

          {/* Invoice Info Row */}
          <div className="grid grid-cols-3 border-b border-foreground text-xs">
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Invoice No:</span>
              <div>{invoiceNumber}</div>
            </div>
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Invoice Date:</span>
              <div>
                {isReadOnly && onUpdateDate && pastDate && !isExporting ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-6 mt-1 text-xs px-2 py-0 border-muted-foreground w-full justify-start text-left font-normal bg-transparent text-foreground hover:bg-muted/50">
                        {currentDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(pastDate)}
                        onSelect={(date) => {
                          if (date) {
                            onUpdateDate(date.toISOString());
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  currentDate
                )}
              </div>
            </div>
            <div className="p-2">
              <span className="font-bold">Payment Mode:</span>
              {isCleanView ? (
                <div className="font-semibold text-xs mt-1">{paymentMode}</div>
              ) : (
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-6 text-xs mt-1 border-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Customer Info Row */}
          <div className="grid grid-cols-3 border-b border-foreground text-xs">
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Customer Name:</span>
              <div>{customerInfo.name}</div>
            </div>
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Phone:</span>
              <div>{customerInfo.phone || '-'}</div>
            </div>
            <div className="p-2">
              <span className="font-bold">Customer GSTIN:</span>
              <div>{customerInfo.gstin || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-foreground p-1 text-center font-bold">Sl.</th>
                  <th className="border border-foreground p-1 text-left font-bold">Description</th>
                  <th className="border border-foreground p-1 text-center font-bold">Batch No</th>
                  <th className="border border-foreground p-1 text-center font-bold">HSN</th>
                  <th className="border border-foreground p-1 text-right font-bold">MRP</th>
                  <th className="border border-foreground p-1 text-center font-bold">Qty</th>
                  <th className="border border-foreground p-1 text-center font-bold">Free</th>
                  <th className="border border-foreground p-1 text-right font-bold">Rate</th>
                  <th className="border border-foreground p-1 text-right font-bold">Total</th>
                  <th className="border border-foreground p-1 text-right font-bold">Taxable</th>
                  <th className="border border-foreground p-1 text-center font-bold">CGST%</th>
                  <th className="border border-foreground p-1 text-right font-bold">CGST</th>
                  <th className="border border-foreground p-1 text-center font-bold">SGST%</th>
                  <th className="border border-foreground p-1 text-right font-bold">SGST</th>
                  {!isCleanView && (
                    <th className="border border-foreground p-1 text-center font-bold">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {editableItems.map((item, index) => {
                  const tax = calculateItemTax(item);
                  const discountedTaxable = item.total - (item.total * discount / 100);
                  const itemCgst = Math.round((discountedTaxable * (tax.cgstRate / 100)) * 100) / 100;
                  const itemSgst = Math.round((discountedTaxable * (tax.sgstRate / 100)) * 100) / 100;

                  return (
                    <tr key={item.productId} className="hover:bg-muted/20">
                      <td className="border border-foreground p-1 text-center">{index + 1}</td>
                      <td className="border border-foreground p-1">
                        {isCleanView ? <span className="text-xs">{item.productName}</span> : (
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItemField(item.productId, 'productName', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 font-medium"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isCleanView ? <span className="text-xs">{item.batchNo || '-'}</span> : (
                          <Input
                            value={item.batchNo}
                            onChange={(e) => updateItemField(item.productId, 'batchNo', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center w-20 font-mono"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isCleanView ? <span className="text-xs">{item.hsnCode || '-'}</span> : (
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => updateItemField(item.productId, 'hsnCode', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center w-16 font-mono"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right">
                        {isCleanView ? <span className="text-xs">₹{item.mrp.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => updateItemField(item.productId, 'mrp', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-right w-16 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isCleanView ? <span className="text-xs font-semibold">{item.quantity}</span> : (
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => updateItemField(item.productId, 'quantity', Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemField(item.productId, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="h-7 w-12 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => updateItemField(item.productId, 'quantity', item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isCleanView ? <span className="text-xs">{item.freeQty || 0}</span> : (
                          <Input
                            type="number"
                            value={item.freeQty}
                            onChange={(e) => updateItemField(item.productId, 'freeQty', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center w-12 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right">
                        {isCleanView ? <span className="text-xs">₹{item.price.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItemField(item.productId, 'price', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-right w-16 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-right">₹{discountedTaxable.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-center font-mono text-xs">{tax.cgstRate.toFixed(2)}%</td>
                      <td className="border border-foreground p-1 text-right">₹{itemCgst.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-center font-mono text-xs">{tax.sgstRate.toFixed(2)}%</td>
                      <td className="border border-foreground p-1 text-right">₹{itemSgst.toFixed(2)}</td>
                      {!isCleanView && (
                        <td className="border border-foreground p-1 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => onRemoveItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-5 border-t-2 border-foreground">
            {/* Amount in Words & Payment Details */}
            <div className="col-span-3 p-3 border-r border-foreground space-y-2">
              <div>
                <span className="font-bold text-xs">Amount in Words:</span>
                <p className="text-xs font-semibold text-primary mt-0.5">{numberToWords(grandTotal)}</p>
              </div>
              <div className="pt-2 border-t border-muted-foreground/30 text-xs space-y-1">
                {paymentMode === "Cash" && (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-foreground">Payment Information:</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Terms: {settings?.defaultPaymentTerms || "Due on Receipt"}</span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground pt-1">Payment Mode: Cash (Paid in Full)</p>
                  </div>
                )}

                {paymentMode === "UPI" && (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-foreground">UPI Payment Details:</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Terms: {settings?.defaultPaymentTerms || "Due on Receipt"}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${encodeURIComponent(settings?.upiId || "lakshmiayurveda@upi")}&pn=${encodeURIComponent(shopInfo.name)}&am=${grandTotal}`}
                        alt="UPI QR Code"
                        className="w-16 h-16 border rounded bg-white p-0.5 shrink-0"
                      />
                      <div className="text-xs font-mono space-y-0.5">
                        <p className="font-bold text-foreground">Scan QR Code to Pay</p>
                        <p className="text-[11px]">UPI ID: <span className="font-semibold text-primary">{settings?.upiId || "lakshmiayurveda@upi"}</span></p>
                        <p className="text-[10px] text-muted-foreground">Pay via GPay, PhonePe, Paytm or BHIM</p>
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMode === "Bank Transfer" || paymentMode === "Card" || paymentMode === "Credit") && (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-foreground">Bank Remittance Info:</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Terms: {settings?.defaultPaymentTerms || "Due on Receipt"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-mono pt-1">
                      <p>Holder: <span className="font-semibold text-foreground">{settings?.accountHolder || shopInfo.name}</span></p>
                      <p>Bank: <span className="font-semibold text-foreground">{settings?.bankName || "State Bank of India"}</span></p>
                      <p>A/C: <span className="font-semibold text-foreground">{settings?.accountNumber || "389201002938"}</span></p>
                      <p>IFSC: <span className="font-semibold text-foreground">{settings?.ifscCode || "SBIN0001234"}</span></p>
                      {settings?.branchName && <p className="col-span-2">Branch: <span className="font-semibold text-foreground">{settings.branchName}</span></p>}
                    </div>
                  </div>
                )}

                {settings?.paymentInstructions && (
                  <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-dashed border-border/80">
                    <span className="font-semibold not-italic text-foreground">Note: </span>{settings.paymentInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Table */}
            <div className="col-span-2 text-xs">
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Discount:</span>
                <div className="flex items-center gap-2">
                  {isCleanView ? (
                    <span className="text-xs text-right font-semibold">{discount}%</span>
                  ) : (
                    <>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => onDiscountChange(Number(e.target.value))}
                        className="w-16 h-6 text-xs text-right"
                      />
                      <span>%</span>
                    </>
                  )}
                  <span className="text-muted-foreground">(-₹{discountAmount.toFixed(2)})</span>
                </div>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Total CGST:</span>
                <span>₹{totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Total SGST:</span>
                <span>₹{totalSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30 text-xs">
                <span>Round Off:</span>
                <span>{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted font-bold text-sm">
                <span>Net Amount:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-5 border-t-2 border-foreground text-xs">
            <div className="col-span-3 p-3 border-r border-foreground">
              <p className="font-bold mb-1">Terms & Conditions:</p>
              {settings?.customTerms ? (
                <p className="whitespace-pre-line">{settings.customTerms}</p>
              ) : (
                <>
                  <p>1. Goods once sold will not be taken back.</p>
                  <p>2. Subject to {shopInfo.state || "Karnataka"} Jurisdiction only.</p>
                  <p>3. E. & O.E.</p>
                </>
              )}
            </div>
            <div className="col-span-2 p-3 text-center">
              <p className="text-xs">For {shopInfo.name}</p>
              <div className="mt-8 border-t border-foreground inline-block px-6 pt-1">
                <p className="text-xs">Authorised Signatory</p>
              </div>
            </div>
          </div>

          {/* Thanks Message */}
          <div className="text-center py-3 bg-muted/30 border-t border-foreground font-bold text-sm">
            *** Thank You for Shopping with Us! ***
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
          {!isReadOnly && (
            <Button onClick={() => onConfirm(editableItems)} className="bg-primary hover:bg-primary/90">
              Confirm & Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
