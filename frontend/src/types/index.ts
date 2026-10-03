export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  stock: number;
  minStock: number;
  unit: string;
  sku: string;
  batchNo?: string;
  hsnCode?: string;
  gstRate?: number; // GST rate in percentage (e.g., 12 for 12%)
  expiryDate?: string; // ISO date string
}

// Helper to check expiry status
export const getExpiryStatus = (expiryDate?: string): 'expired' | 'expiring-soon' | 'valid' | 'unknown' => {
  if (!expiryDate) return 'unknown';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 90) return 'expiring-soon'; // Within 3 months
  return 'valid';
};

export const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  dlNo?: string;
  gstinNo?: string;
  gstin?: string;
  balance: number;
  totalPurchases: number;
}

export interface Settings {
  id: string;
  // Business Profile
  shopName: string;
  companyName?: string;
  tagline?: string;
  address: string;
  city?: string;
  state: string;
  stateCode: string;
  country?: string;
  pincode?: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  pan?: string;
  defaultCurrency?: string;

  // Invoice Templates & Branding Customization
  invoicePrefix: string;
  startingInvoiceNumber?: number;
  paperSize?: 'A4' | 'Thermal' | 'A5';
  templateTheme?: 'modern' | 'professional' | 'minimal' | 'standard' | 'compact';
  showLogo?: boolean;
  customTerms?: string;
  primaryColor?: string;
  logoPosition?: 'left' | 'center' | 'right';
  showTagline?: boolean;
  showGstinInHeader?: boolean;
  showCompanyAddress?: boolean;
  showContactDetails?: boolean;

  // Payment Details
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
  showQrCode?: boolean;
  paymentInstructions?: string;
  defaultPaymentTerms?: string;
  acceptedPaymentMethods?: string[];

  // Tax & GST
  gstin: string;
  defaultGstRate?: number;
  taxType?: 'exclusive' | 'inclusive';
  isComposition?: boolean;
  defaultHsn?: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  freeQty?: number;
  price: number;
  mrp?: number;
  batchNo?: string;
  total: number;
  hsnCode?: string;
  gstRate?: number;
}

export interface Sale {
  id: string;
  invoiceNo?: string;
  date: string;
  customerId: string;
  customerName: string;
  customerDlNo?: string;
  customerGstinNo?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const categories = ["Medicine", "First Aid", "Equipment", "Supplements", "Protection", "Hygiene"];

