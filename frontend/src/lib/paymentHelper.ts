export type PaymentMode = "Credit (15-30 Days)" | "UPI" | "Cash" | "Bank Transfer" | "Card" | "Cheque";

export interface PaymentRecord {
  status: "pending" | "paid" | "partial";
  mode: PaymentMode;
  settledDate?: string;
  referenceNo?: string;
  amountPaid?: number;
  notes?: string;
}

export const PAYMENT_STORAGE_KEY = "billcart_payment_records";

export const getSavedPaymentRecords = (): Record<string, PaymentRecord> => {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const savePaymentRecord = (saleId: string, record: PaymentRecord): Record<string, PaymentRecord> => {
  const existing = getSavedPaymentRecords();
  const updated = { ...existing, [saleId]: record };
  try {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactive sync across components
    window.dispatchEvent(new CustomEvent("billcart_payment_update", { detail: { saleId, record } }));
  } catch (e) {
    console.error("Failed to persist payment record", e);
  }
  return updated;
};

export interface CreditStatusResult {
  effectiveStatus: "pending" | "paid" | "partial" | "overdue";
  mode: PaymentMode;
  settledDate?: string;
  referenceNo: string;
  amountPaid: number;
  dueDate: Date;
  daysUntilDue: number;
  daysSinceInvoice: number;
  label: string;
  sublabel: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

/**
 * Calculates accurate B2B wholesale 15-30 days credit terms and payment status.
 * Clients have a 15 to 30-day payment grace period upon invoice generation.
 */
export const calculateCreditStatus = (
  sale: { id: string; date: string; total: number; invoiceNo?: string },
  recorded?: PaymentRecord
): CreditStatusResult => {
  const now = new Date();
  const saleDate = new Date(sale.date);
  
  // Credit window is 30 days
  const dueDate = new Date(saleDate);
  dueDate.setDate(dueDate.getDate() + 30);

  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysSinceInvoice = Math.max(0, Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)));

  let effectiveStatus: "pending" | "paid" | "partial" | "overdue" = "pending";
  let mode: PaymentMode = "Credit (15-30 Days)";
  let settledDate: string | undefined = undefined;
  let referenceNo = `TXN-${sale.invoiceNo || sale.id.slice(-6)}`;
  let amountPaid = 0;

  if (recorded) {
    effectiveStatus = recorded.status;
    mode = recorded.mode || "Credit (15-30 Days)";
    settledDate = recorded.settledDate;
    referenceNo = recorded.referenceNo || referenceNo;
    amountPaid = recorded.amountPaid ?? (recorded.status === "paid" ? sale.total : 0);
  } else {
    // If not manually marked/settled by admin yet:
    if (daysUntilDue < 0) {
      effectiveStatus = "overdue";
    } else {
      effectiveStatus = "pending";
    }
  }

  let label = "Pending";
  let sublabel = "Credit: 15-30 Days";
  let colorClass = {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  };

  if (effectiveStatus === "paid") {
    label = "Paid / Settled";
    sublabel = settledDate
      ? `Settled on ${new Date(settledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
      : "Full Payment Received";
    colorClass = {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    };
  } else if (effectiveStatus === "partial") {
    label = "Partially Paid";
    sublabel = `₹${amountPaid.toFixed(0)} of ₹${sale.total.toFixed(0)}`;
    colorClass = {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      dot: "bg-sky-500",
    };
  } else if (effectiveStatus === "overdue") {
    label = "Overdue";
    sublabel = `Due passed by ${Math.abs(daysUntilDue)}d`;
    colorClass = {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    };
  } else {
    // Pending Credit
    label = "Pending Credit";
    sublabel = daysUntilDue === 0 ? "Due Today" : `Due in ${daysUntilDue} days`;
    colorClass = {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
    };
  }

  return {
    effectiveStatus,
    mode,
    settledDate,
    referenceNo,
    amountPaid,
    dueDate,
    daysUntilDue,
    daysSinceInvoice,
    label,
    sublabel,
    colorClass,
  };
};
