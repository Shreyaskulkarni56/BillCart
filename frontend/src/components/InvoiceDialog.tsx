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
import { Printer, Download, Plus, Minus, Trash2, Edit2 } from "lucide-react";
import { BillItem, Customer } from "../types";
import { useApp } from "../context/AppContext";
import jsPDF from "jspdf";

interface EditableItem extends BillItem {
  hsnCode: string;
  gstRate: number;
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
  onConfirm: () => void;
  discount: number;
  onDiscountChange: (discount: number) => void;
  isReadOnly?: boolean;
  pastInvoiceNo?: string;
  pastDate?: string;
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
    const enriched = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        hsnCode: item.hsnCode || product?.hsnCode || "3004",
        gstRate: item.gstRate || product?.gstRate || 5,
        freeQty: item.freeQty || 0,
        batchNo: item.batchNo || `B${Date.now().toString().slice(-6)}`,
        mrp: item.mrp || item.price,
      };
    });
    setEditableItems(enriched);
  }, [items]);

  // Update editable item field
  const updateItemField = (productId: string, field: keyof EditableItem, value: string | number) => {
    setEditableItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate tax breakdown per item
  const calculateItemTax = (item: EditableItem) => {
    const taxableAmount = item.total;
    const cgstRate = (item.gstRate || 5) / 2;
    const sgstRate = (item.gstRate || 5) / 2;
    const cgstAmount = taxableAmount * (cgstRate / 100);
    const sgstAmount = taxableAmount * (sgstRate / 100);
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
  const grandTotal = taxableAmount + totalTax;

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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 20px; 
              color: #000;
              background: white;
              font-size: 11px;
            }
            .invoice-container { 
              max-width: 210mm; 
              margin: 0 auto; 
              border: 2px solid #000;
              padding: 0;
            }
            .header { 
              text-align: center; 
              padding: 10px; 
              border-bottom: 2px solid #000;
              background: #f5f5f5;
            }
            .shop-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
            .shop-address { font-size: 11px; margin-bottom: 3px; }
            .gstin { font-size: 12px; font-weight: bold; }
            .invoice-title { 
              text-align: center; 
              padding: 5px; 
              border-bottom: 1px solid #000;
              font-weight: bold;
              font-size: 14px;
              background: #e0e0e0;
            }
            .info-row { 
              display: flex; 
              border-bottom: 1px solid #000;
            }
            .info-cell { 
              padding: 5px 10px; 
              border-right: 1px solid #000;
              flex: 1;
            }
            .info-cell:last-child { border-right: none; }
            .info-label { font-weight: bold; font-size: 10px; }
            .info-value { font-size: 11px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th { 
              background: #e0e0e0; 
              padding: 6px 4px; 
              text-align: center; 
              font-size: 9px;
              font-weight: bold;
              border: 1px solid #000;
              text-transform: uppercase;
            }
            td { 
              padding: 5px 4px; 
              border: 1px solid #000;
              font-size: 10px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .summary-section { 
              display: flex; 
              border-top: 2px solid #000;
            }
            .amount-words { 
              flex: 2; 
              padding: 10px; 
              border-right: 1px solid #000;
              font-size: 11px;
            }
            .summary-table { 
              flex: 1; 
              padding: 0;
            }
            .summary-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 4px 10px;
              border-bottom: 1px solid #ccc;
            }
            .summary-row.total { 
              font-weight: bold; 
              font-size: 13px;
              background: #f0f0f0;
              border-bottom: none;
            }
            .footer { 
              display: flex; 
              border-top: 2px solid #000;
            }
            .footer-left { 
              flex: 2; 
              padding: 10px; 
              border-right: 1px solid #000;
              font-size: 10px;
            }
            .footer-right { 
              flex: 1; 
              padding: 10px; 
              text-align: center;
            }
            .signature-line { 
              margin-top: 40px; 
              border-top: 1px solid #000; 
              padding-top: 5px;
              font-size: 10px;
            }
            .thanks { 
              text-align: center; 
              padding: 8px; 
              background: #f5f5f5; 
              font-weight: bold;
              font-size: 11px;
              border-top: 1px solid #000;
            }
            @media print { 
              body { padding: 0; }
              .invoice-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="shop-name">${shopInfo.name}</div>
              <div class="shop-address">${shopInfo.address.replace(/\n/g, ', ')}</div>
              <div class="shop-address">Phone: ${shopInfo.phone} | Email: ${shopInfo.email}</div>
              ${shopInfo.gstin ? `<div class="gstin">GSTIN: ${shopInfo.gstin}</div>` : ''}
            </div>
            
            <div class="invoice-title">TAX INVOICE</div>
            
            <div class="info-row">
              <div class="info-cell">
                <div class="info-label">Invoice No:</div>
                <div class="info-value">${invoiceNumber}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">Invoice Date:</div>
                <div class="info-value">${currentDate}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">Payment Mode:</div>
                <div class="info-value">${paymentMode}</div>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-cell">
                <div class="info-label">Customer Name:</div>
                <div class="info-value">${customerInfo.name}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">Phone:</div>
                <div class="info-value">${customerInfo.phone || '-'}</div>
              </div>
              <div class="info-cell">
                <div class="info-label">Customer GSTIN:</div>
                <div class="info-value">${customerInfo.gstin || 'N/A'}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 25px;">Sl.</th>
                  <th style="width: 120px;">Description of Goods</th>
                  <th style="width: 50px;">Batch No</th>
                  <th style="width: 45px;">HSN</th>
                  <th style="width: 50px;">MRP</th>
                  <th style="width: 30px;">Qty</th>
                  <th style="width: 30px;">Free</th>
                  <th style="width: 50px;">Rate</th>
                  <th style="width: 55px;">Total</th>
                  <th style="width: 55px;">Taxable</th>
                  <th style="width: 30px;">CGST%</th>
                  <th style="width: 45px;">CGST</th>
                  <th style="width: 30px;">SGST%</th>
                  <th style="width: 45px;">SGST</th>
                </tr>
              </thead>
              <tbody>
                ${editableItems.map((item, index) => {
      const tax = calculateItemTax(item);
      const discountedTaxable = item.total - (item.total * discount / 100);
      const itemCgst = Math.round((discountedTaxable * (tax.cgstRate / 100)) * 100) / 100;
      const itemSgst = Math.round((discountedTaxable * (tax.sgstRate / 100)) * 100) / 100;
      return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td class="text-left">${item.productName}</td>
                      <td class="text-center">${item.batchNo || '-'}</td>
                      <td class="text-center">${item.hsnCode}</td>
                      <td class="text-right">₹${item.mrp.toFixed(2)}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-center">${item.freeQty || 0}</td>
                      <td class="text-right">₹${item.price.toFixed(2)}</td>
                      <td class="text-right">₹${item.total.toFixed(2)}</td>
                      <td class="text-right">₹${discountedTaxable.toFixed(2)}</td>
                      <td class="text-center">${tax.cgstRate.toFixed(2)}%</td>
                      <td class="text-right">₹${itemCgst.toFixed(2)}</td>
                      <td class="text-center">${tax.sgstRate.toFixed(2)}%</td>
                      <td class="text-right">₹${itemSgst.toFixed(2)}</td>
                    </tr>
                  `;
    }).join('')}
              </tbody>
            </table>
            
            <div class="summary-section">
              <div class="amount-words">
                <strong>Amount in Words:</strong><br/>
                ${numberToWords(grandTotal)}
              </div>
              <div class="summary-table">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row">
                  <span>Discount (${discount}%):</span>
                  <span>-₹${discountAmount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row">
                  <span>Total CGST:</span>
                  <span>₹${totalCgst.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Total SGST:</span>
                  <span>₹${totalSgst.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                  <span>Net Amount:</span>
                  <span>₹${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <strong>Terms & Conditions:</strong><br/>
                1. Goods once sold will not be taken back.<br/>
                2. Subject to ${shopInfo.state} Jurisdiction only.<br/>
                3. E. & O.E.
              </div>
              <div class="footer-right">
                <div>For ${shopInfo.name}</div>
                <div class="signature-line">Authorised Signatory</div>
              </div>
            </div>
            
            <div class="thanks">*** Thank You for Shopping with Us! ***</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let yPos = 10;

    // Border
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 277);

    // Header Background
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 25, "F");

    yPos += 5;

    // Shop Name
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(shopInfo.name, pageWidth / 2, yPos + 5, { align: "center" });

    // Shop Address
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(shopInfo.address.replace(/\n/g, ', '), pageWidth / 2, yPos + 10, { align: "center" });
    pdf.text(`Phone: ${shopInfo.phone} | Email: ${shopInfo.email}`, pageWidth / 2, yPos + 14, { align: "center" });

    // GSTIN
    if (shopInfo.gstin) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`GSTIN: ${shopInfo.gstin}`, pageWidth / 2, yPos + 19, { align: "center" });
    }

    yPos += 27;

    // Tax Invoice Title
    pdf.setFillColor(224, 224, 224);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 7, "F");
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("TAX INVOICE", pageWidth / 2, yPos + 5, { align: "center" });

    yPos += 9;

    // Invoice Info Row
    pdf.setDrawColor(0);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    const colWidth = (pageWidth - margin * 2) / 3;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice No:", margin + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(invoiceNumber, margin + 2, yPos + 8);

    pdf.line(margin + colWidth, yPos, margin + colWidth, yPos + 11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice Date:", margin + colWidth + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(currentDate, margin + colWidth + 2, yPos + 8);

    pdf.line(margin + colWidth * 2, yPos, margin + colWidth * 2, yPos + 11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Mode:", margin + colWidth * 2 + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(paymentMode, margin + colWidth * 2 + 2, yPos + 8);

    yPos += 11;
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    // Customer Info Row
    pdf.setFont("helvetica", "bold");
    pdf.text("Customer Name:", margin + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(customerInfo.name, margin + 2, yPos + 8);

    pdf.line(margin + colWidth, yPos, margin + colWidth, yPos + 11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Phone:", margin + colWidth + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(customerInfo.phone || '-', margin + colWidth + 2, yPos + 8);

    pdf.line(margin + colWidth * 2, yPos, margin + colWidth * 2, yPos + 11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Customer GSTIN:", margin + colWidth * 2 + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(customerInfo.gstin || 'N/A', margin + colWidth * 2 + 2, yPos + 8);

    yPos += 11;
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 2;

    // Table Header
    const tableHeaders = ['Sl.', 'Description', 'Batch', 'HSN', 'MRP', 'Qty', 'Free', 'Rate', 'Total', 'Taxable', 'CGST%', 'CGST', 'SGST%', 'SGST'];
    const colWidths = [7, 28, 14, 12, 14, 8, 8, 14, 16, 16, 10, 14, 10, 14];

    pdf.setFillColor(224, 224, 224);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 7, "F");

    pdf.setFontSize(5);
    pdf.setFont("helvetica", "bold");
    let xPos = margin;
    tableHeaders.forEach((header, i) => {
      pdf.text(header, xPos + colWidths[i] / 2, yPos + 4.5, { align: "center" });
      xPos += colWidths[i];
    });

    yPos += 7;

    // Table Rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);

    editableItems.forEach((item, index) => {
      const tax = calculateItemTax(item);
      const discountedTaxable = item.total - (item.total * discount / 100);
      const itemCgst = discountedTaxable * (tax.cgstRate / 100);
      const itemSgst = discountedTaxable * (tax.sgstRate / 100);

      pdf.line(margin, yPos, pageWidth - margin, yPos);

      xPos = margin;
      const rowData = [
        `${index + 1}`,
        item.productName.substring(0, 16),
        item.batchNo?.substring(0, 8) || '-',
        item.hsnCode || '',
        `${item.mrp.toFixed(2)}`,
        `${item.quantity}`,
        `${item.freeQty || 0}`,
        `${item.price.toFixed(2)}`,
        `${item.total.toFixed(2)}`,
        `${discountedTaxable.toFixed(2)}`,
        `${tax.cgstRate.toFixed(2)}%`,
        `${itemCgst.toFixed(2)}`,
        `${tax.sgstRate.toFixed(2)}%`,
        `${itemSgst.toFixed(2)}`
      ];

      rowData.forEach((data, i) => {
        const align = i === 1 ? "left" : (i >= 4 && i !== 5 && i !== 6 ? "right" : "center");
        const textX = align === "left" ? xPos + 1 : (align === "right" ? xPos + colWidths[i] - 1 : xPos + colWidths[i] / 2);
        pdf.text(data, textX, yPos + 4, { align: align as "left" | "center" | "right" });
        xPos += colWidths[i];
      });

      yPos += 6;
    });

    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 3;

    // Summary Section
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    const summaryStartY = yPos;
    const summaryLeftWidth = (pageWidth - margin * 2) * 0.6;

    // Amount in Words
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Amount in Words:", margin + 2, yPos + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const words = numberToWords(grandTotal);
    const splitWords = pdf.splitTextToSize(words, summaryLeftWidth - 5);
    pdf.text(splitWords, margin + 2, yPos + 10);

    // Vertical line
    pdf.line(margin + summaryLeftWidth, yPos, margin + summaryLeftWidth, yPos + 28);

    // Summary values
    const summaryX = margin + summaryLeftWidth + 2;
    const valueX = pageWidth - margin - 2;
    let summaryY = yPos + 5;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text("Subtotal:", summaryX, summaryY);
    pdf.text(`₹${subtotal.toFixed(2)}`, valueX, summaryY, { align: "right" });

    if (discount > 0) {
      summaryY += 5;
      pdf.text(`Discount (${discount}%):`, summaryX, summaryY);
      pdf.text(`-₹${discountAmount.toFixed(2)}`, valueX, summaryY, { align: "right" });
    }

    summaryY += 5;
    pdf.text("Total CGST:", summaryX, summaryY);
    pdf.text(`₹${totalCgst.toFixed(2)}`, valueX, summaryY, { align: "right" });

    summaryY += 5;
    pdf.text("Total SGST:", summaryX, summaryY);
    pdf.text(`₹${totalSgst.toFixed(2)}`, valueX, summaryY, { align: "right" });

    summaryY += 6;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin + summaryLeftWidth, summaryY - 3, pageWidth - margin * 2 - summaryLeftWidth, 7, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Net Amount:", summaryX, summaryY + 2);
    pdf.text(`₹${grandTotal.toFixed(2)}`, valueX, summaryY + 2, { align: "right" });

    yPos = summaryStartY + 28;
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    // Footer
    yPos += 3;
    const footerLeftWidth = (pageWidth - margin * 2) * 0.65;

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("Terms & Conditions:", margin + 2, yPos + 4);
    pdf.setFont("helvetica", "normal");
    pdf.text("1. Goods once sold will not be taken back.", margin + 2, yPos + 8);
    pdf.text(`2. Subject to ${shopInfo.state} Jurisdiction only.`, margin + 2, yPos + 12);
    pdf.text("3. E. & O.E.", margin + 2, yPos + 16);

    pdf.line(margin + footerLeftWidth, yPos, margin + footerLeftWidth, yPos + 25);

    pdf.setFontSize(8);
    const signX = margin + footerLeftWidth + (pageWidth - margin * 2 - footerLeftWidth) / 2;
    pdf.text(`For ${shopInfo.name}`, signX, yPos + 5, { align: "center" });
    pdf.line(signX - 20, yPos + 18, signX + 20, yPos + 18);
    pdf.text("Authorised Signatory", signX, yPos + 22, { align: "center" });

    yPos += 25;
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    // Thanks message
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("*** Thank You for Shopping with Us! ***", pageWidth / 2, yPos + 5, { align: "center" });

    pdf.save(`Invoice_${invoiceNumber.replace(/\//g, '_')}.pdf`);
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
        <div ref={invoiceRef} className="bg-white border-2 border-foreground rounded-none text-foreground text-sm font-serif">
          {/* Header */}
          <div className="text-center p-4 border-b-2 border-foreground bg-muted/30">
            <h1 className="text-xl font-bold uppercase tracking-wide">{shopInfo.name}</h1>
            <p className="text-xs mt-1">{shopInfo.address.replace(/\n/g, ', ')}</p>
            <p className="text-xs">Phone: {shopInfo.phone} | Email: {shopInfo.email}</p>
            {shopInfo.gstin && <p className="text-sm font-bold mt-1">GSTIN: {shopInfo.gstin}</p>}
          </div>

          {/* Tax Invoice Title */}
          <div className="text-center py-2 border-b border-foreground bg-muted font-bold text-base">
            TAX INVOICE
          </div>

          {/* Invoice Info Row */}
          <div className="grid grid-cols-3 border-b border-foreground text-xs">
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Invoice No:</span>
              <div>{invoiceNumber}</div>
            </div>
            <div className="p-2 border-r border-foreground">
              <span className="font-bold">Invoice Date:</span>
              <div>{currentDate}</div>
            </div>
            <div className="p-2">
              <span className="font-bold">Payment Mode:</span>
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
                  <th className="border border-foreground p-1 text-center font-bold">Actions</th>
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
                        {isReadOnly ? <span className="text-xs">{item.productName}</span> : (
                          <Input
                            value={item.productName}
                            onChange={(e) => updateItemField(item.productId, 'productName', e.target.value)}
                            className="h-6 text-xs border-0 p-0 bg-transparent"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isReadOnly ? <span className="text-xs">{item.batchNo}</span> : (
                          <Input
                            value={item.batchNo}
                            onChange={(e) => updateItemField(item.productId, 'batchNo', e.target.value)}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-center w-20"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isReadOnly ? <span className="text-xs">{item.hsnCode}</span> : (
                          <Input
                            value={item.hsnCode}
                            onChange={(e) => updateItemField(item.productId, 'hsnCode', e.target.value)}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-center w-14"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right">
                        {isReadOnly ? <span className="text-xs">{item.mrp.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => updateItemField(item.productId, 'mrp', Number(e.target.value))}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-right w-16"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isReadOnly ? <span className="text-xs">{item.quantity}</span> : (
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => updateItemField(item.productId, 'quantity', Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemField(item.productId, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="h-6 w-10 text-xs border-0 p-0 bg-transparent text-center"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => updateItemField(item.productId, 'quantity', item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-center">
                        {isReadOnly ? <span className="text-xs">{item.freeQty}</span> : (
                          <Input
                            type="number"
                            value={item.freeQty}
                            onChange={(e) => updateItemField(item.productId, 'freeQty', Number(e.target.value))}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-center w-10"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right">
                        {isReadOnly ? <span className="text-xs">{item.price.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItemField(item.productId, 'price', Number(e.target.value))}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-right w-16"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-right">₹{discountedTaxable.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-center">
                        {isReadOnly ? <span className="text-xs">{tax.cgstRate.toFixed(2)}</span> : (
                          <Input
                            type="number"
                            step="0.01"
                            value={tax.cgstRate}
                            onChange={(e) => updateItemField(item.productId, 'gstRate', Number(e.target.value) * 2)}
                            className="h-6 text-xs border-0 p-0 bg-transparent text-center w-10"
                          />
                        )}
                      </td>
                      <td className="border border-foreground p-1 text-right">₹{itemCgst.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-center">{tax.sgstRate.toFixed(2)}%</td>
                      <td className="border border-foreground p-1 text-right">₹{itemSgst.toFixed(2)}</td>
                      <td className="border border-foreground p-1 text-center">
                        {!isReadOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => onRemoveItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-5 border-t-2 border-foreground">
            {/* Amount in Words */}
            <div className="col-span-3 p-3 border-r border-foreground">
              <span className="font-bold text-xs">Amount in Words:</span>
              <p className="text-xs mt-1">{numberToWords(grandTotal)}</p>
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
                  {isReadOnly ? <span className="w-16 h-6 text-xs text-right">{discount}</span> : (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => onDiscountChange(Number(e.target.value))}
                      className="w-16 h-6 text-xs text-right"
                    />
                  )}
                  <span>%</span>
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
              <p>1. Goods once sold will not be taken back.</p>
              <p>2. Subject to {shopInfo.state} Jurisdiction only.</p>
              <p>3. E. & O.E.</p>
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
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {!isReadOnly && (
            <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90">
              Confirm & Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
