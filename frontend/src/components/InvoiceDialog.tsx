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
import QRCode from "qrcode";
import { toast } from "sonner";

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
  onConfirm: (customItems?: BillItem[], paymentMode?: string) => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
  isReadOnly?: boolean;
  pastInvoiceNo?: string;
  pastDate?: string;
  onUpdateDate?: (date: string) => void;
  initialPaymentMode?: string;
  pastPaymentMode?: string;
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
  dlNo?: string;
  gstinNo?: string;
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
  initialPaymentMode,
  pastPaymentMode,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>(
    pastPaymentMode || initialPaymentMode || "Credit (15-30 Days)"
  );
  const { products, settings, sales } = useApp();

  React.useEffect(() => {
    if (pastPaymentMode) {
      setPaymentMode(pastPaymentMode);
    } else if (initialPaymentMode) {
      setPaymentMode(initialPaymentMode);
    }
  }, [pastPaymentMode, initialPaymentMode, isOpen]);

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
    dlNo: customer?.dlNo || "",
    gstinNo: customer?.gstinNo || customer?.gstin || "",
  });

  React.useEffect(() => {
    if (customer) {
      setCustomerInfo({
        name: customer.name,
        address: customer.address || "",
        phone: customer.phone || "",
        dlNo: customer.dlNo || "",
        gstinNo: customer.gstinNo || customer.gstin || "",
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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const isCleanView = isReadOnly || isExporting;

  // Generate UPI QR Code locally & reliably without third-party network dependencies
  React.useEffect(() => {
    if (isOpen) {
      const upiId = (settings?.upiId || "lakshmiayurveda@upi").trim();
      const payeeName = (shopInfo.name || settings?.shopName || "LAKSHMI AYURVEDA Distributors").trim();
      const fallbackTotal = items.reduce(
        (sum, item) => sum + (Number(item.total) || ((Number(item.quantity) || 1) * (Number(item.price) || 0))),
        0
      );
      const effectiveTotal = grandTotal > 0 ? grandTotal : fallbackTotal;
      const amountStr = effectiveTotal > 0 ? effectiveTotal.toFixed(2) : "0.00";
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;

      QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error("Failed to generate UPI QR code:", err);
          QRCode.toDataURL(`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`)
            .then((url) => setQrCodeDataUrl(url))
            .catch(() => {});
        });
    }
  }, [isOpen, settings?.upiId, shopInfo.name, grandTotal, invoiceNumber, items]);

  // Exact Preview-to-Print Handler: Copies exact rendered preview element DOM and document styles
  const handlePrint = async () => {
    if (!invoiceRef.current) return;

    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 120));

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

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
                margin: 6mm;
              }
              @media print {
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background-color: #ffffff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
              }
              .invoice-print-wrapper {
                width: 100%;
                max-width: 200mm;
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
                }, 400);
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

  // Exact Preview-to-PDF Handler: Captures high-DPI canvas snapshot with fixed A4 dimensions and perfect alignment
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const element = invoiceRef.current;

      // Ensure all images (logo, QR code) are loaded
      const images = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById("printable-tax-invoice");
          if (clonedEl) {
            clonedEl.style.width = "794px"; // Exact 210mm in pixels at 96 DPI
            clonedEl.style.minWidth = "794px";
            clonedEl.style.maxWidth = "794px";
            clonedEl.style.boxSizing = "border-box";
            clonedEl.style.margin = "0 auto";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm margin
      const printableWidth = pdfWidth - margin * 2; // 194mm
      const maxPrintableHeight = pdfHeight - margin * 2; // 281mm

      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      if (imgHeight > maxPrintableHeight) {
        // Scale to fit neatly onto a single A4 page without clipping footer/terms
        const scale = maxPrintableHeight / imgHeight;
        const scaledWidth = printableWidth * scale;
        const xOffset = margin + (printableWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "PNG", xOffset, margin, scaledWidth, maxPrintableHeight, undefined, "FAST");
      } else {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight, undefined, "FAST");
      }

      pdf.save(`Invoice_${invoiceNumber.replace(/[\/\\]/g, "_")}.pdf`);
      toast.success("Invoice PDF generated and downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate PDF snapshot:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto p-4 sm:p-6 bg-white border border-slate-200 shadow-xl rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-200">
          <DialogTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-bold text-slate-900">Tax Invoice Preview</span>
              <span className="badge-pill bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-xs">
                {invoiceNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 shadow-xs">
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print (A4)
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="h-8 gap-1.5 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 shadow-xs">
                <Download className="w-3.5 h-3.5 text-slate-600" />
                {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Preview */}
        {/* Invoice Container with Dynamic Theme & Branding Settings */}
        <div
          id="printable-tax-invoice"
          ref={invoiceRef}
          className="bg-white border-2 rounded-none text-foreground text-sm font-sans shadow-sm overflow-hidden"
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
          <div className="flex flex-row border-b border-foreground text-xs w-full">
            <div style={{ width: "33.33%" }} className="p-2 border-r border-foreground">
              <span className="font-bold">Invoice No:</span>
              <div className="font-mono font-bold text-primary text-sm mt-0.5">{invoiceNumber}</div>
            </div>
            <div style={{ width: "33.33%" }} className="p-2 border-r border-foreground">
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
                  <div className="font-medium mt-0.5">{currentDate}</div>
                )}
              </div>
            </div>
            <div style={{ width: "33.34%" }} className="p-2">
              <span className="font-bold">Payment Mode & Terms:</span>
              {isCleanView ? (
                <div className="font-semibold text-xs mt-0.5 flex items-center justify-between">
                  <span>{paymentMode}</span>
                  {paymentMode.startsWith("Credit") ? (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      15–30 Days Credit
                    </span>
                  ) : paymentMode === "Cash" ? (
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Cash Received
                    </span>
                  ) : paymentMode === "UPI" ? (
                    <span className="text-[10px] text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      UPI Settled
                    </span>
                  ) : paymentMode === "Bank Transfer" ? (
                    <span className="text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      Bank Transfer
                    </span>
                  ) : paymentMode === "Card" ? (
                    <span className="text-[10px] text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                      Card Settled
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {paymentMode}
                    </span>
                  )}
                </div>
              ) : (
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-6 text-xs mt-1 border-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit (15-30 Days)">Credit (15–30 Days)</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Customer Info Row */}
          <div className="flex flex-row border-b border-foreground text-xs w-full">
            <div style={{ width: "30%" }} className="p-2 border-r border-foreground">
              <span className="font-bold">Customer Name:</span>
              <div className="font-semibold text-slate-900 mt-0.5">{customerInfo.name}</div>
            </div>
            <div style={{ width: "22%" }} className="p-2 border-r border-foreground">
              <span className="font-bold">Phone:</span>
              <div className="mt-0.5">{customerInfo.phone || '-'}</div>
            </div>
            <div style={{ width: "24%" }} className="p-2 border-r border-foreground">
              <span className="font-bold">D.L. No.:</span>
              <div className="mt-0.5 font-mono">{customerInfo.dlNo || 'N/A'}</div>
            </div>
            <div style={{ width: "24%" }} className="p-2">
              <span className="font-bold">GSTIN No.:</span>
              <div className="mt-0.5 font-mono">{customerInfo.gstinNo || customerInfo.gstin || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table with Exact Proportional Widths */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-foreground">
                  <th style={{ width: "3%" }} className="border border-foreground p-1 text-center font-bold">Sl.</th>
                  <th style={{ width: isCleanView ? "24%" : "20%" }} className="border border-foreground p-1 text-left font-bold">Description</th>
                  <th style={{ width: "9%" }} className="border border-foreground p-1 text-center font-bold">Batch No</th>
                  <th style={{ width: "7%" }} className="border border-foreground p-1 text-center font-bold">HSN</th>
                  <th style={{ width: "7%" }} className="border border-foreground p-1 text-right font-bold">MRP</th>
                  <th style={{ width: "5%" }} className="border border-foreground p-1 text-center font-bold">Qty</th>
                  <th style={{ width: "4%" }} className="border border-foreground p-1 text-center font-bold">Free</th>
                  <th style={{ width: "7%" }} className="border border-foreground p-1 text-right font-bold">Rate</th>
                  <th style={{ width: "8%" }} className="border border-foreground p-1 text-right font-bold">Total</th>
                  <th style={{ width: "8%" }} className="border border-foreground p-1 text-right font-bold">Taxable</th>
                  <th style={{ width: "4%" }} className="border border-foreground p-1 text-center font-bold">CGST%</th>
                  <th style={{ width: "5%" }} className="border border-foreground p-1 text-right font-bold">CGST</th>
                  <th style={{ width: "4%" }} className="border border-foreground p-1 text-center font-bold">SGST%</th>
                  <th style={{ width: "5%" }} className="border border-foreground p-1 text-right font-bold">SGST</th>
                  {!isCleanView && (
                    <th style={{ width: "4%" }} className="border border-foreground p-1 text-center font-bold">Del</th>
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
                    <tr key={item.productId || index} className="hover:bg-muted/20">
                      <td style={{ width: "3%" }} className="border border-foreground p-1 text-center font-mono">{index + 1}</td>
                      <td style={{ width: isCleanView ? "24%" : "20%" }} className="border border-foreground p-1 truncate font-medium">
                        {isCleanView ? <span className="text-xs">{item.productName}</span> : (
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItemField(item.productId, 'productName', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 font-medium"
                          />
                        )}
                      </td>
                      <td style={{ width: "9%" }} className="border border-foreground p-1 text-center font-mono">
                        {isCleanView ? <span className="text-xs">{item.batchNo || '-'}</span> : (
                          <Input
                            value={item.batchNo}
                            onChange={(e) => updateItemField(item.productId, 'batchNo', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center w-full font-mono"
                          />
                        )}
                      </td>
                      <td style={{ width: "7%" }} className="border border-foreground p-1 text-center font-mono">
                        {isCleanView ? <span className="text-xs">{item.hsnCode || '-'}</span> : (
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => updateItemField(item.productId, 'hsnCode', e.target.value)}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-center w-full font-mono"
                          />
                        )}
                      </td>
                      <td style={{ width: "7%" }} className="border border-foreground p-1 text-right font-mono">
                        {isCleanView ? <span className="text-xs">₹{item.mrp.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => updateItemField(item.productId, 'mrp', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 hover:border-primary focus:border-primary focus:bg-background rounded px-1 text-right w-full font-mono"
                          />
                        )}
                      </td>
                      <td style={{ width: "5%" }} className="border border-foreground p-1 text-center">
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
                              className="h-7 w-9 text-xs border border-muted/60 rounded px-0.5 text-center font-mono font-bold"
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
                      <td style={{ width: "4%" }} className="border border-foreground p-1 text-center font-mono">
                        {isCleanView ? <span className="text-xs">{item.freeQty || 0}</span> : (
                          <Input
                            type="number"
                            value={item.freeQty}
                            onChange={(e) => updateItemField(item.productId, 'freeQty', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 rounded px-0.5 text-center w-full font-mono"
                          />
                        )}
                      </td>
                      <td style={{ width: "7%" }} className="border border-foreground p-1 text-right font-mono">
                        {isCleanView ? <span className="text-xs">₹{item.price.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItemField(item.productId, 'price', Number(e.target.value))}
                            className="h-7 text-xs border border-muted/60 rounded px-1 text-right w-full font-mono"
                          />
                        )}
                      </td>
                      <td style={{ width: "8%" }} className="border border-foreground p-1 text-right font-medium font-mono">₹{item.total.toFixed(2)}</td>
                      <td style={{ width: "8%" }} className="border border-foreground p-1 text-right font-mono">₹{discountedTaxable.toFixed(2)}</td>
                      <td style={{ width: "4%" }} className="border border-foreground p-1 text-center font-mono text-[10px]">{tax.cgstRate.toFixed(1)}%</td>
                      <td style={{ width: "5%" }} className="border border-foreground p-1 text-right font-mono">₹{itemCgst.toFixed(2)}</td>
                      <td style={{ width: "4%" }} className="border border-foreground p-1 text-center font-mono text-[10px]">{tax.sgstRate.toFixed(1)}%</td>
                      <td style={{ width: "5%" }} className="border border-foreground p-1 text-right font-mono">₹{itemSgst.toFixed(2)}</td>
                      {!isCleanView && (
                        <td style={{ width: "4%" }} className="border border-foreground p-1 text-center">
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

          {/* Summary Section with Always-Generated Dynamic UPI QR Code & Bank Remittance */}
          <div className="flex flex-row border-t-2 border-foreground w-full">
            {/* Amount in Words, Bank Details & UPI QR Code */}
            <div style={{ width: "60%" }} className="p-3 border-r border-foreground space-y-2">
              <div>
                <span className="font-bold text-xs">Amount in Words:</span>
                <p className="text-xs font-bold text-indigo-700 mt-0.5">{numberToWords(grandTotal)}</p>
              </div>

              {/* Dynamic QR Code & Bank Remittance Box */}
              <div className="pt-2 border-t border-muted-foreground/30 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-foreground">Remittance & Digital Payment:</span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                    paymentMode.startsWith("Credit")
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    {paymentMode.startsWith("Credit") ? "Payment Terms: 15 to 30 Days Credit" : `Payment Mode: ${paymentMode}`}
                  </span>
                </div>

                <div className="flex flex-row items-center gap-3 bg-slate-50/70 p-2 rounded border border-slate-200">
                  {/* Dynamic UPI QR Code Container */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-20 h-20 border rounded bg-white p-0.5 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-20 h-20 border rounded bg-white flex flex-col items-center justify-center text-[10px] text-slate-400 p-1 text-center">
                        <span className="animate-pulse">Generating QR...</span>
                      </div>
                    )}
                    <div className="text-[11px] font-mono space-y-0.5">
                      <p className="font-bold text-slate-900">Scan & Pay via UPI</p>
                      <p className="text-[10px] text-slate-700">UPI ID: <span className="font-bold text-indigo-700">{settings?.upiId || "lakshmiayurveda@upi"}</span></p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[170px]">Payee: {shopInfo.name}</p>
                      <p className="text-[11px] font-bold text-emerald-700">Amount: ₹{grandTotal.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-400">PhonePe • GPay • Paytm • BHIM</p>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="border-l border-slate-200 pl-3 text-[10px] font-mono space-y-0.5 flex-1 w-full">
                    <p className="font-bold text-slate-800 text-[11px]">Bank Remittance Details:</p>
                    <p><span className="text-slate-500">Bank:</span> <span className="font-semibold">{settings?.bankName || "State Bank of India"}</span></p>
                    <p><span className="text-slate-500">A/C:</span> <span className="font-bold text-slate-900">{settings?.accountNumber || "389201002938"}</span></p>
                    <p><span className="text-slate-500">IFSC:</span> <span className="font-bold text-slate-900">{settings?.ifscCode || "SBIN0001234"}</span></p>
                    <p><span className="text-slate-500">Holder:</span> {settings?.accountHolder || shopInfo.name}</p>
                  </div>
                </div>

                {settings?.paymentInstructions && (
                  <p className="text-[10px] italic text-muted-foreground pt-1.5 border-t border-dashed border-border/80 mt-1.5">
                    <span className="font-semibold not-italic text-foreground">Note: </span>{settings.paymentInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Table */}
            <div style={{ width: "40%" }} className="text-xs">
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Discount:</span>
                <div className="flex items-center gap-2">
                  {isCleanView ? (
                    <span className="text-xs text-right font-semibold font-mono">{discount}%</span>
                  ) : (
                    <>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => onDiscountChange(Number(e.target.value))}
                        className="w-16 h-6 text-xs text-right font-mono"
                      />
                      <span>%</span>
                    </>
                  )}
                  <span className="text-muted-foreground font-mono">(-₹{discountAmount.toFixed(2)})</span>
                </div>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Total CGST:</span>
                <span className="font-mono">₹{totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30">
                <span>Total SGST:</span>
                <span className="font-mono">₹{totalSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 border-b border-muted-foreground/30 text-xs">
                <span>Round Off:</span>
                <span className="font-mono">{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-100 font-bold text-sm text-slate-900">
                <span>Net Amount:</span>
                <span className="font-mono text-base text-indigo-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-row border-t-2 border-foreground text-xs w-full">
            <div style={{ width: "60%" }} className="p-3 border-r border-foreground">
              <p className="font-bold mb-1">Terms & Conditions:</p>
              {settings?.customTerms ? (
                <p className="whitespace-pre-line text-[11px] leading-relaxed">{settings.customTerms}</p>
              ) : (
                <div className="text-[11px] space-y-0.5 text-slate-700">
                  <p>1. Goods once sold will not be taken back.</p>
                  <p>2. Payment due within 15 to 30 days of invoice date.</p>
                  <p>3. Subject to {shopInfo.state || "Karnataka"} Jurisdiction only. E. & O.E.</p>
                </div>
              )}
            </div>
            <div style={{ width: "40%" }} className="p-3 text-center flex flex-col justify-between">
              <p className="text-xs font-semibold">For {shopInfo.name}</p>
              <div className="mt-8 border-t border-foreground inline-block px-6 pt-1">
                <p className="text-xs font-medium">Authorised Signatory</p>
              </div>
            </div>
          </div>

          {/* Thanks Message */}
          <div className="text-center py-2.5 bg-slate-50 border-t border-foreground font-bold text-xs tracking-wider text-slate-700">
            *** Thank You for Shopping with Us! ***
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} className="h-9 text-xs border-slate-200 bg-white">
            Cancel
          </Button>
          {!isReadOnly && (
            <Button onClick={() => onConfirm(editableItems, paymentMode)} className="h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
              Confirm & Generate Invoice
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
